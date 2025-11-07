import React, { useState } from 'react';
import { Recipe } from '../types';
import { AlertTriangleIcon, SparklesIcon, VideoIcon, SpeakerIcon, StopCircleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface RecipeModalProps {
    isLoading: boolean;
    recipes: Recipe[];
    error: string | null;
    onGenerateVideo: (recipe: Recipe) => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-bg/50 p-4 rounded-lg">
                <div className="h-4 bg-border-color rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-border-color rounded w-full"></div>
                <div className="h-3 bg-border-color rounded w-5/6 mt-1"></div>
            </div>
        ))}
    </div>
);

const RecipeModal: React.FC<RecipeModalProps> = ({ isLoading, recipes, error, onGenerateVideo }) => {
    const { t } = useLanguage();
    const { play, stop, isLoading: isGeneratingSpeech, isPlaying } = useAudioPlayer();
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

    const formatRecipeForTTS = (recipe: Recipe): string => {
        const ingredientsTitle = t('recipeModal.ingredients');
        const instructionsTitle = t('recipeModal.instructions');
        const ingredientsText = recipe.ingredients.join(', ');
        const instructionsText = recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join(' ');
        return `${recipe.name}. ${recipe.description}. ${ingredientsTitle}: ${ingredientsText}. ${instructionsTitle}: ${instructionsText}`;
    };

    const handlePlayRecipe = (recipe: Recipe) => {
        const isCurrentlyThisRecipe = isPlaying && currentlyPlaying === recipe.name;

        if (isCurrentlyThisRecipe) {
            stop();
            setCurrentlyPlaying(null);
        } else {
            if (isPlaying) {
                stop();
            }
            setCurrentlyPlaying(recipe.name);
            const textToSpeak = formatRecipeForTTS(recipe);
            play(textToSpeak).finally(() => {
                // When playback finishes naturally, reset the playing state indicator
                if (currentlyPlaying === recipe.name) {
                    setCurrentlyPlaying(null);
                }
            });
        }
    };


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

    if (recipes.length === 0) {
        return (
            <div className="text-center text-text-dark">
                {t('recipeModal.no_recipes')}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {recipes.map((recipe, index) => (
                <div key={index} className="bg-dark-bg p-4 rounded-lg border border-border-color">
                    <h4 className="font-bold text-primary text-lg flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-accent" />
                        {recipe.name}
                    </h4>
                    <p className="text-text-dark text-sm mt-1">{recipe.description}</p>
                    
                    <div className="mt-4">
                        <h5 className="font-semibold text-text-light mb-2">{t('recipeModal.ingredients')}</h5>
                        <ul className="list-disc list-inside text-text-dark text-sm space-y-1 pl-2">
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>

                     <div className="mt-4">
                        <h5 className="font-semibold text-text-light mb-2">{t('recipeModal.instructions')}</h5>
                        <ol className="list-decimal list-inside text-text-dark text-sm space-y-2 pl-2">
                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                    <div className="mt-4 flex gap-3">
                         <button
                            onClick={() => onGenerateVideo(recipe)}
                            className="flex-1 flex items-center justify-center gap-2 bg-secondary/20 text-secondary font-bold py-2 px-3 rounded-lg hover:bg-secondary/40 transition-colors duration-200"
                        >
                            <VideoIcon className="w-5 h-5" />
                            {t('recipeModal.generate_video_guide')}
                        </button>
                        <button
                            onClick={() => handlePlayRecipe(recipe)}
                            className="flex-1 flex items-center justify-center gap-2 bg-accent/20 text-accent font-bold py-2 px-3 rounded-lg hover:bg-accent/40 transition-colors duration-200 disabled:opacity-50"
                            disabled={isGeneratingSpeech && currentlyPlaying !== recipe.name}
                        >
                            {isGeneratingSpeech && currentlyPlaying === recipe.name ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : isPlaying && currentlyPlaying === recipe.name ? (
                                <StopCircleIcon className="w-5 h-5" />
                            ) : (
                                <SpeakerIcon className="w-5 h-5" />
                            )}
                            <span>{
                                isGeneratingSpeech && currentlyPlaying === recipe.name ? t('recipeModal.loading_speech') :
                                isPlaying && currentlyPlaying === recipe.name ? t('recipeModal.stop_recipe') :
                                t('recipeModal.hear_recipe')
                            }</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecipeModal;