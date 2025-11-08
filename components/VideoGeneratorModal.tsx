import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Recipe } from '../types';
import { generateRecipeVideo } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, AlertTriangleIcon, VideoIcon } from './icons';

interface VideoGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: Recipe | null;
}

const loadingMessages = [
    "Prepping the digital kitchen...",
    "Sourcing the freshest pixels...",
    "Simmering the visual elements...",
    "Plating your video guide...",
    "Final touches, chef's kiss!",
    "Almost ready to serve...",
];

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({ isOpen, onClose, recipe }) => {
    const { t } = useLanguage();
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const constructPrompt = useCallback((recipe: Recipe) => {
        const steps = recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
        return `Create a short, engaging animated video guide for a recipe called "${recipe.name}". The video should be visually appealing and easy to follow for a home cook. Show each step clearly as a distinct scene. The steps are:\n\n${steps}`;
    }, []);

    useEffect(() => {
        if (recipe) {
            setPrompt(constructPrompt(recipe));
        }
    }, [recipe, constructPrompt]);
    
    useEffect(() => {
        if (!isOpen) {
            setGeneratedVideoUrl(null);
            setError(null);
            setIsLoading(false);
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
            return;
        }

        const checkKey = async () => {
            setIsCheckingApiKey(true);
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
            setIsCheckingApiKey(false);
        };
        checkKey();

    }, [isOpen]);

    const handleSelectKey = async () => {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true);
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setGeneratedVideoUrl(null);
        setError(null);

        let messageIndex = 0;
        loadingIntervalRef.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 5000);

        try {
            const url = await generateRecipeVideo(prompt, aspectRatio);
            setGeneratedVideoUrl(url);
        } catch (e) {
            const err = e as Error;
            console.error(err);
            if (err.message.includes("Requested entity was not found")) {
                setError("Your API key is invalid. Please select a valid key.");
                setApiKeySelected(false);
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
        }
    };
    
    if (!isOpen || !recipe) return null;

    const renderContent = () => {
        if (isCheckingApiKey) {
            return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
        }
        if (!apiKeySelected) {
            return (
                <div className="text-center p-4">
                    <h3 className="text-lg font-semibold text-text-light mb-4">API Key Required</h3>
                    <p className="text-text-dark mb-6">To generate videos with Veo, you need to select an API key. This is a premium feature.</p>
                    <button onClick={handleSelectKey} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">Select API Key</button>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline mt-4 block">Learn about billing</a>
                </div>
            );
        }
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-6 text-text-light font-semibold text-lg">{loadingMessage}</p>
                    <p className="text-text-dark text-sm mt-2">Video generation can take a few minutes. Please be patient.</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <AlertTriangleIcon className="w-12 h-12 text-danger mb-4" />
                    <p className="text-text-light font-semibold mb-2">Generation Failed</p>
                    <p className="text-text-dark mb-6 max-w-sm">{error}</p>
                    <button onClick={handleGenerate} className="bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-500 transition-colors">Try Again</button>
                </div>
            );
        }
        if (generatedVideoUrl) {
            return (
                <div className="space-y-4">
                    <video src={generatedVideoUrl} controls autoPlay className="w-full rounded-lg" />
                    <button onClick={() => setGeneratedVideoUrl(null)} className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors">Generate Another Video</button>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-text-dark mb-1">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={8}
                        className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Aspect Ratio</label>
                    <div className="flex gap-3">
                        {(['16:9', '9:16'] as const).map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors border-2 ${aspectRatio === ratio ? 'bg-primary border-primary text-white' : 'bg-dark-bg border-border-color text-text-dark hover:border-primary'}`}
                            >
                                {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors"
                >
                    <VideoIcon />
                    Generate Video
                </button>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-light-bg w-full max-w-2xl rounded-2xl shadow-2xl border border-border-color transform transition-all duration-300 scale-95 animate-modal-enter"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h2 className="text-xl font-bold text-primary">{`Video Guide: ${recipe.name}`}</h2>
                    <button onClick={onClose} className="text-text-dark hover:text-text-light transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
            <style>{`
                @keyframes modal-enter {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-enter {
                    animation: modal-enter 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default VideoGeneratorModal;
