import React from 'react';
import { SmartPlateData } from '../types';
import { AlertTriangleIcon, FireIcon, ChefHatIcon, SpeakerIcon, StopCircleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import NutritionPieChart from './NutritionPieChart';

interface SmartPlateModalProps {
    data: SmartPlateData | null;
    isLoading: boolean;
    error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-border-color rounded w-2/3 mx-auto"></div>
        <div className="h-4 bg-border-color rounded w-full"></div>
        <div className="h-4 bg-border-color rounded w-5/6"></div>
        <div className="flex justify-center mt-4">
            <div className="h-10 bg-border-color rounded-full w-1/3"></div>
        </div>
        {/* Skeleton for Pie Chart */}
        <div className="p-4 bg-dark-bg rounded-lg border border-border-color">
             <div className="h-5 bg-border-color rounded w-1/2 mx-auto mb-4"></div>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="w-40 h-40 bg-border-color rounded-full flex-shrink-0"></div>
                <div className="space-y-3 w-full sm:w-1/2">
                    <div className="h-4 bg-border-color rounded w-full"></div>
                    <div className="h-4 bg-border-color rounded w-3/4"></div>
                    <div className="h-4 bg-border-color rounded w-full"></div>
                    <div className="h-4 bg-border-color rounded w-5/6"></div>
                </div>
            </div>
        </div>
    </div>
);

const SmartPlateModal: React.FC<SmartPlateModalProps> = ({ data, isLoading, error }) => {
    const { t } = useLanguage();
    const { play, stop, isLoading: isGeneratingSpeech, isPlaying } = useAudioPlayer();

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center text-center text-danger">
                <AlertTriangleIcon className="w-10 h-10 mb-3" />
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-text-dark">
                No Smart Plate data available.
            </div>
        );
    }

    const formatSmartPlateForTTS = (plate: SmartPlateData): string => {
        const ingredientsTitle = t('recipeModal.ingredients');
        const instructionsTitle = t('recipeModal.instructions');
        const ingredientsText = plate.ingredients.join(', ');
        const instructionsText = plate.instructions.map((step, i) => `${i + 1}. ${step}`).join(' ');
        return `${plate.name}. ${plate.description}. ${ingredientsTitle}: ${ingredientsText}. ${instructionsTitle}: ${instructionsText}`;
    };

    const handlePlay = () => {
        if (isPlaying) {
            stop();
        } else {
            const textToSpeak = formatSmartPlateForTTS(data);
            play(textToSpeak);
        }
    };


    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                    <ChefHatIcon className="w-7 h-7" />
                    {data.name}
                </h3>
                <p className="text-text-dark text-sm mt-2">{data.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-dark-bg px-4 py-2 rounded-full border border-border-color">
                    <FireIcon className="w-5 h-5 text-warning" />
                    <span className="font-bold text-text-light">{data.calories}</span>
                    <span className="text-text-dark text-sm">calories</span>
                </div>
            </div>
            
            {data.nutrition && <NutritionPieChart data={data.nutrition} />}

            <div>
                <h4 className="font-semibold text-text-light mb-2">{t('recipeModal.ingredients')}</h4>
                <ul className="list-disc list-inside text-text-dark text-sm space-y-1 pl-2">
                    {data.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-text-light mb-2">{t('recipeModal.instructions')}</h4>
                <ol className="list-decimal list-inside text-text-dark text-sm space-y-2 pl-2">
                    {data.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
            </div>

             <div className="mt-6">
                <button
                    onClick={handlePlay}
                    className="w-full flex items-center justify-center gap-2 bg-accent/20 text-accent font-bold py-3 px-4 rounded-lg hover:bg-accent/40 transition-colors duration-200 disabled:opacity-50"
                    disabled={isGeneratingSpeech}
                >
                    {isGeneratingSpeech ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                        <StopCircleIcon className="w-5 h-5" />
                    ) : (
                        <SpeakerIcon className="w-5 h-5" />
                    )}
                    <span>{
                        isGeneratingSpeech ? t('recipeModal.loading_speech') :
                        isPlaying ? t('recipeModal.stop_recipe') :
                        t('recipeModal.hear_recipe')
                    }</span>
                </button>
            </div>
        </div>
    );
};

export default SmartPlateModal;