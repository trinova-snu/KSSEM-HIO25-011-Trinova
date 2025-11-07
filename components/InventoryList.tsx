

import React, { useState, useMemo } from 'react';
import { InventoryItem as InventoryItemType } from '../types';
import InventoryItem from './InventoryItem';
import { InfoIcon, TagIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryListProps {
    items: InventoryItemType[];
    onDeleteItem: (id: string) => void;
    onGetRecipes: (item: InventoryItemType) => void;
    showRecipeButton?: boolean;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onDeleteItem, onGetRecipes, showRecipeButton = true }) => {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        return ['All', ...uniqueCategories.sort()];
    }, [items]);

    const filteredAndSortedItems = useMemo(() => {
        return items
            .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [items, selectedCategory]);

    if (items.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-light-bg rounded-xl shadow-lg flex flex-col items-center border border-border-color">
                 <InfoIcon className="w-12 h-12 text-secondary mb-4"/>
                <h2 className="text-2xl font-bold text-text-light mb-2">{t('inventory.empty_title')}</h2>
                <p className="text-text-dark max-w-md">
                    {t('inventory.empty_desc')}
                </p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-text-dark mr-2">Filter by:</span>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
                            selectedCategory === category
                                ? 'bg-primary border-primary text-white'
                                : 'bg-dark-bg border-border-color text-text-dark hover:border-primary'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {filteredAndSortedItems.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedItems.map(item => (
                        <InventoryItem
                            key={item.id}
                            item={item}
                            onDeleteItem={onDeleteItem}
                            onGetRecipes={onGetRecipes}
                            showRecipeButton={showRecipeButton}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-light-bg rounded-xl shadow-lg flex flex-col items-center border border-border-color">
                    <TagIcon className="w-12 h-12 text-secondary mb-4"/>
                    <h2 className="text-2xl font-bold text-text-light mb-2">No Items Found</h2>
                    <p className="text-text-dark max-w-md">
                        There are no items in the "{selectedCategory}" category.
                    </p>
                </div>
            )}
        </div>
    );
};

export default InventoryList;