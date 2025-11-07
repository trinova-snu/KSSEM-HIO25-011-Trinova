import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLearningContent } from '../services/geminiService';
import { LearningModuleContent, QuizQuestion } from '../types';
import * as Icons from './icons';

interface LearningModuleProps {
    topicId: 'food-storage' | 'carbon-impact';
    onBack: () => void;
}

type View = 'loading' | 'error' | 'learning' | 'quiz' | 'results';

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    FridgeIcon: Icons.FridgeIcon,
    AppleIcon: Icons.AppleIcon,
    CubeIcon: Icons.CubeIcon,
    CalendarIcon: Icons.CalendarIcon,
    TagIcon: Icons.TagIcon,
    LeafIcon: Icons.LeafIcon,
    TrashIcon: Icons.TrashIcon,
    FactoryIcon: Icons.FactoryIcon,
    SparklesIcon: Icons.SparklesIcon,
    ChartBarIcon: Icons.ChartBarIcon,
    AlertTriangleIcon: Icons.AlertTriangleIcon,
    CheckCircleIcon: Icons.CheckCircleIcon,
    XCircleIcon: Icons.XCircleIcon,
};

const LearningModule: React.FC<LearningModuleProps> = ({ topicId, onBack }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState<View>('loading');
    const [content, setContent] = useState<LearningModuleContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Learning State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ correct: boolean, explanation: string } | null>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await getLearningContent(topicId, language);
                setContent(data);
                setView('learning');
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
                setView('error');
            }
        };
        fetchContent();
    }, [topicId, language]);

    const handleAnswerSelect = (option: string) => {
        if (feedback) return; // Prevent changing answer after feedback is shown

        setSelectedAnswer(option);
        const currentQuestion = content!.quiz[currentQuestionIndex];
        const isCorrect = option === currentQuestion.correctAnswer;
        setFeedback({ correct: isCorrect, explanation: currentQuestion.explanation });

        if (isCorrect) {
            setScore(s => s + 1);
        }
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < content!.quiz.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
            setFeedback(null);
        } else {
            setView('results');
        }
    };

    if (view === 'loading') {
        return <div className="text-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
    }

    if (view === 'error') {
        return <div className="text-center py-20 text-danger"><Icons.AlertTriangleIcon className="w-12 h-12 mx-auto mb-4" />{error}</div>;
    }

    const currentCard = content!.cards[currentCardIndex];
    const CardIcon = iconMap[currentCard.icon] || Icons.InfoIcon;
    const currentQuestion = content!.quiz[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-text-dark hover:text-text-light transition-colors mb-4">
                <Icons.ArrowLeftIcon className="w-5 h-5" />
                <span>{t('knowledge.back_to_hub')}</span>
            </button>
            <div className="bg-light-bg/50 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-border-color/50 min-h-[500px] flex flex-col">
                {view === 'learning' && (
                    <div className="flex flex-col flex-1 justify-between animate-fade-in">
                        <div>
                            <div className="text-center mb-6">
                                <CardIcon className="w-12 h-12 text-primary mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-text-light">{currentCard.title}</h2>
                            </div>
                            <p className="text-text-dark text-center leading-relaxed">{currentCard.content}</p>
                        </div>
                        <div className="mt-8">
                            <p className="text-center text-sm text-text-dark mb-4">{t('knowledge.progress_text', { current: currentCardIndex + 1, total: content!.cards.length })}</p>
                            <div className="w-full bg-dark-bg rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((currentCardIndex + 1) / content!.cards.length) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <button onClick={() => setCurrentCardIndex(i => i - 1)} disabled={currentCardIndex === 0} className="p-3 rounded-full bg-dark-bg text-text-light hover:bg-border-color disabled:opacity-50"><Icons.ChevronLeftIcon/></button>
                                {currentCardIndex === content!.cards.length - 1 ? (
                                    <button onClick={() => setView('quiz')} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-hover">{t('knowledge.start_quiz')}</button>
                                ) : (
                                    <button onClick={() => setCurrentCardIndex(i => i + 1)} className="p-3 rounded-full bg-dark-bg text-text-light hover:bg-border-color"><Icons.ChevronRightIcon/></button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {view === 'quiz' && (
                     <div className="flex flex-col flex-1 animate-fade-in">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-primary">{t('knowledge.quiz_title')} ({currentQuestionIndex + 1}/{content!.quiz.length})</h2>
                            <p className="text-text-light mt-2 text-lg">{currentQuestion.question}</p>
                        </div>
                        <div className="space-y-3 flex-1">
                            {currentQuestion.options.map((option, i) => {
                                const isSelected = selectedAnswer === option;
                                let buttonClass = 'bg-dark-bg border-border-color hover:border-primary';
                                if (isSelected) {
                                    buttonClass = feedback?.correct ? 'bg-success/20 border-success' : 'bg-danger/20 border-danger';
                                } else if (feedback && option === currentQuestion.correctAnswer) {
                                     buttonClass = 'bg-success/20 border-success';
                                }
                                return (
                                <button key={i} onClick={() => handleAnswerSelect(option)} disabled={!!feedback} className={`w-full text-left p-4 rounded-lg border-2 transition-colors font-semibold text-text-light ${buttonClass}`}>
                                    {option}
                                </button>
                            )})}
                        </div>
                        {feedback && (
                            <div className={`mt-4 p-4 rounded-lg text-center animate-fade-in ${feedback.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                <p className="font-bold">{feedback.correct ? t('knowledge.correct_feedback') : `${t('knowledge.incorrect_feedback')} "${currentQuestion.correctAnswer}"`}</p>
                                <p className="text-sm mt-1">{feedback.explanation}</p>
                                <button onClick={handleNextQuestion} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-hover">{t('knowledge.next_question')}</button>
                            </div>
                        )}
                    </div>
                )}
                 {view === 'results' && (
                     <div className="flex flex-col flex-1 justify-center items-center text-center animate-fade-in">
                        <Icons.TrophyIcon className="w-20 h-20 text-accent mb-4"/>
                        <h2 className="text-3xl font-bold text-primary">{t('knowledge.results_title')}</h2>
                        <p className="text-xl text-text-light mt-2">{t('knowledge.results_score', { score: score, total: content!.quiz.length })}</p>
                        <button onClick={onBack} className="mt-8 bg-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-blue-500 transition-colors">{t('knowledge.back_to_hub')}</button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LearningModule;
