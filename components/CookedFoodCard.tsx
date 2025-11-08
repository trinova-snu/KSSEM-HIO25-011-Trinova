
import React from 'react';
import { CookedFoodItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ChefHatIcon, ClockIcon, MapPinIcon } from './icons';

interface CookedFoodCardProps {
    item: CookedFoodItem;
    onClaim: () => void;
}

const CookedFoodCard: React.FC<CookedFoodCardProps> = ({ item, onClaim }) => {
    const { t } = useLanguage();
    
    return (
        <div className="bg-light-bg rounded-xl shadow-lg p-5 flex flex-col justify-between border border-border-color transition-all transform hover:-translate-y-1 duration-200">
            <div>
                <h3 className="text-xl font-bold text-text-light capitalize">{item.name}</h3>
                <div className="flex items-center gap-2 text-sm text-text-dark mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{item.hotelName}</span>
                </div>
                <p className="text-sm text-text-dark my-3">{item.description}</p>
                <div className="space-y-2 text-sm text-text-dark">
                    <div className="flex items-center gap-2">
                        <ChefHatIcon className="w-4 h-4 text-accent" />
                        <span>{t('dashboard.serves', { count: item.quantity })}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-accent" />
                        <span>{t('dashboard.order_by', { time: item.availableUntil })}</span>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <button
                    onClick={onClaim}
                    className="w-full bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors duration-200"
                >
                    {t('dashboard.claim_now')}
                </button>
            </div>
        </div>
    );
};
// FIX: Removed unnecessary redeclaration of ClockIcon.

export default CookedFoodCard;