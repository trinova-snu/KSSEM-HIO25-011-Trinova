import React, { useState } from 'react';
import { InventoryItem, Recipe, MembershipTier, RequirementRequest } from '../types';
import { CalendarIcon, CubeIcon, ChefHatIcon, TruckIcon, InfoIcon, SearchIcon, SparklesIcon, MapPinIcon, MegaphoneIcon, VideoIcon, SpeakerIcon, StopCircleIcon } from './icons';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';
import MembershipCard from './MembershipCard';
import Badges from './Badges';
import VideoGeneratorModal from './VideoGeneratorModal';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface HotelPantryProps {
    expiringSoonItems: InventoryItem[];
    bulkExpiringItems: InventoryItem[];
    smartRecipes: Recipe[] | null;
    isLoadingSmartRecipes: boolean;
    onOpenCreateDonationModal: () => void;
    donationCount: number;
    membershipTier: MembershipTier | null;
    requirementRequests: RequirementRequest[];
}

const ItemCard: React.FC<{ item: InventoryItem; }> = ({ item }) => (
    <div className="bg-light-bg p-4 rounded-lg border border-border-color">
        <h4 className="font-bold text-text-light capitalize">{item.name}</h4>
        <div className="text-sm text-text-dark mt-1 space-y-1">
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-accent" />
                <span>Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
            <div className="flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-accent" />
                <span>Quantity: {item.quantity}</span>
            </div>
        </div>
    </div>
);

const RecipeCardSkeleton: React.FC = () => (
    <div className="bg-light-bg p-6 rounded-lg border border-border-color animate-pulse">
        <div className="h-5 bg-border-color rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-border-color rounded w-full mb-2"></div>
        <div className="h-4 bg-border-color rounded w-5/6"></div>
    </div>
);

const HotelPantry: React.FC<HotelPantryProps> = ({
    expiringSoonItems,
    bulkExpiringItems,
    smartRecipes,
    isLoadingSmartRecipes,
    onOpenCreateDonationModal,
    donationCount,
    membershipTier,
    requirementRequests,
}) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
    const [videoRecipe, setVideoRecipe] = useState<Recipe | null>(null);
    const { play, stop, isLoading: isGeneratingSpeech, isPlaying } = useAudioPlayer();

    const filteredExpiringSoon = expiringSoonItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBulkExpiring = bulkExpiringItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatRecipeForTTS = (recipe: Recipe): string => {
        const ingredientsTitle = t('recipeModal.ingredients');
        const instructionsTitle = t('recipeModal.instructions');
        const ingredientsText = recipe.ingredients.join(', ');
        const instructionsText = recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join(' ');
        return `${recipe.name}. ${recipe.description}. ${ingredientsTitle}: ${ingredientsText}. ${instructionsTitle}: ${instructionsText}`;
    };

    const handlePlayRecipe = (recipe: Recipe) => {
        if (isPlaying) {
            stop();
        } else {
            const textToSpeak = formatRecipeForTTS(recipe);
            play(textToSpeak);
        }
    };


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder={t('hotelPantry.search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-light-bg border-2 border-border-color rounded-full px-5 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <SearchIcon className="w-5 h-5 text-text-dark" />
                    </div>
                </div>
                 {membershipTier && <MembershipCard tier={membershipTier} />}
            </div>

             {requirementRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-text-light border-b-2 border-secondary/50 pb-2 flex items-center gap-3">
                        <MegaphoneIcon className="text-secondary" />
                        {t('hotelPantry.urgent_needs_header')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requirementRequests.map(req => (
                            <div key={req.id} className="bg-secondary/10 p-4 rounded-lg border border-secondary/30">
                                <h4 className="font-bold text-secondary">{req.foodBankName}</h4>
                                <p className="text-xs text-secondary/80 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {req.foodBankLocation}</p>
                                <p className="text-sm text-text-dark my-2">{req.message}</p>
                                <div className="flex flex-wrap gap-2">
                                    {req.requestedItems.map(item => (
                                        <span key={item} className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary/20 text-secondary">{item}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-text-light border-b-2 border-primary/50 pb-2">{t('hotelPantry.expiring_soon_header')}</h2>
                     {filteredExpiringSoon.length > 0 ? (
                        filteredExpiringSoon.map(item => <ItemCard key={item.id} item={item} />)
                    ) : (
                         <div className="text-center py-10 px-4 bg-light-bg rounded-lg flex flex-col items-center border border-border-color">
                            <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                            <p className="text-text-dark">{searchQuery ? t('hotelPantry.no_match') : t('hotelPantry.no_expiring_soon')}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b-2 border-primary/50 pb-2">
                         <h2 className="text-2xl font-bold text-text-light">{t('hotelPantry.bulk_items_header')}</h2>
                         <button 
                            onClick={onOpenCreateDonationModal}
                            disabled={bulkExpiringItems.length === 0}
                            className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            <TruckIcon className="w-5 h-5" />
                            {t('hotelPantry.create_donation_button')}
                         </button>
                    </div>
                    {filteredBulkExpiring.length > 0 ? (
                        filteredBulkExpiring.map(item => <ItemCard key={item.id} item={item} />)
                    ) : (
                         <div className="text-center py-10 px-4 bg-light-bg rounded-lg flex flex-col items-center border border-border-color">
                             <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                            <p className="text-text-dark">{searchQuery ? t('hotelPantry.no_match') : t('hotelPantry.no_bulk_items')}</p>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4 lg:sticky lg:top-24">
                     <h2 className="text-2xl font-bold text-text-light border-b-2 border-primary/50 pb-2">{t('hotelPantry.smart_recipes_header')}</h2>
                     {isLoadingSmartRecipes ? (
                        <div className="space-y-4">
                             <RecipeCardSkeleton />
                             <RecipeCardSkeleton />
                        </div>
                     ) : (
                        smartRecipes && smartRecipes.length > 0 ? (
                            <div className="space-y-4">
                                {smartRecipes.map((recipe, index) => (
                                     <div key={index} className="bg-light-bg p-6 rounded-lg border border-border-color flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                                                <ChefHatIcon className="w-6 h-6" />
                                                {recipe.name}
                                            </h3>
                                            <p className="text-text-dark mt-2 text-sm">{recipe.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => setViewingRecipe(recipe)}
                                            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary/20 text-primary font-bold py-2 px-3 rounded-lg hover:bg-primary/40 transition-colors duration-200"
                                        >
                                            <SparklesIcon />
                                            {t('hotelPantry.view_recipe_button')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 px-4 bg-light-bg rounded-lg flex flex-col items-center border border-border-color">
                                <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                                <p className="text-text-dark">{t('hotelPantry.no_recipes')}</p>
                            </div>
                        )
                     )}
                </div>
            </div>

             <Badges donationCount={donationCount} />

            {viewingRecipe && (
                <Modal isOpen={!!viewingRecipe} onClose={() => setViewingRecipe(null)} title={viewingRecipe.name}>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        <p className="text-text-dark text-sm mb-4">{viewingRecipe.description}</p>
                        
                        <div className="mb-4">
                            <h4 className="font-bold text-lg text-primary mb-2">{t('recipeModal.ingredients')}</h4>
                            <ul className="list-disc list-inside text-text-dark space-y-1 pl-2">
                                {viewingRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-lg text-primary mb-2">{t('recipeModal.instructions')}</h4>
                            <ol className="list-decimal list-inside text-text-dark space-y-2 pl-2">
                                {viewingRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setVideoRecipe(viewingRecipe);
                                    setViewingRecipe(null);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-secondary/20 text-secondary font-bold py-2 px-3 rounded-lg hover:bg-secondary/40 transition-colors duration-200"
                            >
                                <VideoIcon className="w-5 h-5" />
                                {t('recipeModal.generate_video_guide')}
                            </button>
                            <button
                                onClick={() => handlePlayRecipe(viewingRecipe)}
                                className="flex-1 flex items-center justify-center gap-2 bg-accent/20 text-accent font-bold py-2 px-3 rounded-lg hover:bg-accent/40 transition-colors duration-200 disabled:opacity-50"
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
                </Modal>
            )}
            
            <VideoGeneratorModal isOpen={!!videoRecipe} onClose={() => setVideoRecipe(null)} recipe={videoRecipe} />
        </div>
    );
};

export default HotelPantry;