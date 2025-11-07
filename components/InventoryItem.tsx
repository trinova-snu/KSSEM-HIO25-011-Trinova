
import React from 'react';
import { InventoryItem as InventoryItemType } from '../types';
import { CalendarIcon, CubeIcon, TagIcon, TrashIcon, SparklesIcon } from './icons';

interface InventoryItemProps {
    item: InventoryItemType;
    onDeleteItem: (id: string) => void;
    onGetRecipes: (item: InventoryItemType) => void;
    showRecipeButton?: boolean;
}

interface ExpiryStatus {
    text: string;
    badgeColorClass: string;
    borderColorClass: string;
    daysLeft: number;
}

const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateParts = expiryDate.split('-').map(part => parseInt(part, 10));
    const expiry = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const dayText = Math.abs(diffDays) === 1 ? 'day' : 'days';
        return {
            text: `Expired ${Math.abs(diffDays)} ${dayText} ago`,
            badgeColorClass: 'bg-danger/20 text-danger border-danger/30',
            borderColorClass: 'border-danger',
            daysLeft: diffDays
        };
    }
    if (diffDays === 0) {
        return {
            text: 'Expires Today',
            badgeColorClass: 'bg-danger/20 text-danger border-danger/30',
            borderColorClass: 'border-danger',
            daysLeft: diffDays
        };
    }
    if (diffDays <= 3) {
        const dayText = diffDays === 1 ? 'day' : 'days';
        return {
            text: `Expires in ${diffDays} ${dayText}`,
            badgeColorClass: 'bg-warning/20 text-warning border-warning/30',
            borderColorClass: 'border-warning',
            daysLeft: diffDays
        };
    }
    return {
        text: `Expires in ${diffDays} days`,
        badgeColorClass: 'bg-success/20 text-success border-success/30',
        borderColorClass: 'border-success',
        daysLeft: diffDays
    };
};


const InventoryItem: React.FC<InventoryItemProps> = ({ item, onDeleteItem, onGetRecipes, showRecipeButton = true }) => {
    const { text, badgeColorClass, borderColorClass, daysLeft } = getExpiryStatus(item.expiryDate);

    return (
        <div className={`bg-light-bg rounded-xl shadow-lg p-5 flex flex-col justify-between transition-all transform hover:-translate-y-1 duration-200 border-2 ${borderColorClass}`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-text-light capitalize">{item.name}</h3>
                     <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${badgeColorClass}`}>
                        {text}
                    </div>
                </div>
                <div className="space-y-2 text-sm text-text-dark">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        <span>{new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CubeIcon className="w-4 h-4 text-accent" />
                        <span>{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-accent" />
                        <span className="capitalize">{item.category}</span>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex gap-2">
                {showRecipeButton && (
                    <button
                        onClick={() => onGetRecipes(item)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50"
                        disabled={daysLeft < 0}
                        title={daysLeft < 0 ? "Cannot get recipes for expired items" : "Get Recipe Ideas"}
                    >
                        <SparklesIcon />
                        Recipes
                    </button>
                )}
                <button
                    onClick={() => onDeleteItem(item.id)}
                    className={`bg-danger/20 text-danger p-2 rounded-lg hover:bg-danger/40 hover:text-white transition-colors duration-200 ${!showRecipeButton && 'flex-1'}`}
                    title="Delete Item"
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

export default InventoryItem;