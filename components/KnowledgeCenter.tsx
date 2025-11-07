import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LeafIcon, FridgeIcon } from './icons';
import LearningModule from './LearningModule';

type Topic = 'food-storage' | 'carbon-impact';

const TopicCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left bg-light-bg border border-border-color hover:border-primary p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 group"
    >
        <div className="flex items-center gap-4">
            <div className="bg-dark-bg p-4 rounded-full border-2 border-border-color group-hover:border-primary transition-colors">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg text-text-light">{title}</h3>
                <p className="text-sm text-text-dark">{description}</p>
            </div>
        </div>
    </button>
);

const KnowledgeCenter: React.FC = () => {
    const { t } = useLanguage();
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    if (selectedTopic) {
        return <LearningModule topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-text-light tracking-tighter">{t('knowledge.title')}</h1>
                <p className="text-text-dark mt-2">{t('knowledge.select_topic')}</p>
            </div>
            <div className="space-y-4">
                <TopicCard
                    title={t('knowledge.storage_title')}
                    description={t('knowledge.storage_desc')}
                    icon={<FridgeIcon className="w-8 h-8 text-secondary" />}
                    onClick={() => setSelectedTopic('food-storage')}
                />
                <TopicCard
                    title={t('knowledge.carbon_title')}
                    description={t('knowledge.carbon_desc')}
                    icon={<LeafIcon className="w-8 h-8 text-success" />}
                    onClick={() => setSelectedTopic('carbon-impact')}
                />
            </div>
        </div>
    );
};

export default KnowledgeCenter;
