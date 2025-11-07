import React, { useState } from 'react';
import { ShoppingListItem as ShoppingListItemType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon, ShoppingCartIcon, TrashIcon, BotIcon, PlusIcon } from './icons';

interface ShoppingListProps {
    items: ShoppingListItemType[];
    isLoading: boolean;
    onGenerate: () => void;
    onUpdateItem: (id: string, updates: Partial<ShoppingListItemType>) => void;
    onDeleteItem: (id: string) => void;
    onAddItem: (item: { name: string; quantity: string; notes?: string }) => void;
}

const LoadingSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-light-bg p-4 rounded-xl border border-border-color flex items-center gap-4">
                <div className="w-6 h-6 bg-dark-bg rounded"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-bg rounded w-3/4"></div>
                    <div className="h-3 bg-dark-bg rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

const ShoppingList: React.FC<ShoppingListProps> = ({ items, isLoading, onGenerate, onUpdateItem, onDeleteItem, onAddItem }) => {
    const { t } = useLanguage();
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');

    const handleAddItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        onAddItem({ 
            name: newItemName, 
            quantity: newItemQuantity || '1', 
            notes: newItemNotes 
        });
        setNewItemName('');
        setNewItemQuantity('');
        setNewItemNotes('');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-text-light tracking-tighter">{t('shoppingList.title')}</h1>
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="mt-4 flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-hover transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                    title={isLoading ? t('shoppingList.generating_tooltip') : ''}
                >
                    <SparklesIcon />
                    {t('shoppingList.generate_button')}
                </button>
            </div>

            <div className="bg-dark-bg/50 p-6 rounded-2xl border border-border-color min-h-[400px]">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : items.length === 0 ? (
                    <div className="text-center py-20 px-6 flex flex-col items-center">
                        <ShoppingCartIcon className="w-12 h-12 text-secondary mb-4" />
                        <h2 className="text-2xl font-bold text-text-light mb-2">{t('shoppingList.empty_prompt')}</h2>
                        <p className="text-text-dark max-w-md">{t('shoppingList.empty_desc')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className={`bg-light-bg p-4 rounded-xl border border-border-color flex items-center gap-4 transition-all duration-300 ${item.checked ? 'opacity-60' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={(e) => onUpdateItem(item.id, { checked: e.target.checked })}
                                    className="w-6 h-6 rounded bg-dark-bg border-border-color text-primary focus:ring-primary flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <p className={`font-bold text-text-light capitalize ${item.checked ? 'line-through text-text-dark' : ''}`}>
                                        {item.name}
                                        {item.quantity && <span className="ml-2 font-normal text-sm text-text-dark">({item.quantity})</span>}
                                    </p>
                                     <div className="flex items-center gap-2 text-xs text-text-dark mt-1">
                                        {item.isAiGenerated ? (
                                            <>
                                                <BotIcon className="w-3 h-3 text-accent" />
                                                <span>{item.reason}</span>
                                            </>
                                        ) : item.notes ? (
                                            <span>{item.notes}</span>
                                        ) : null}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteItem(item.id)}
                                    className="text-text-dark hover:text-danger transition-colors p-2"
                                    title="Delete Item"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <form onSubmit={handleAddItemSubmit} className="pt-6 border-t border-border-color/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="itemName" className="text-xs text-text-dark px-2">{t('shoppingList.item_name_label')}</label>
                        <input
                            id="itemName"
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={t('shoppingList.add_item_placeholder')}
                            className="w-full bg-light-bg border-2 border-border-color rounded-full px-5 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="itemQty" className="text-xs text-text-dark px-2">{t('shoppingList.quantity_label')}</label>
                        <input
                            id="itemQty"
                            type="text"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            placeholder={t('shoppingList.quantity_placeholder')}
                            className="w-full bg-light-bg border-2 border-border-color rounded-full px-5 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="itemNotes" className="text-xs text-text-dark px-2">{t('shoppingList.notes_label')}</label>
                    <input
                        id="itemNotes"
                        type="text"
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                        placeholder={t('shoppingList.notes_placeholder')}
                        className="w-full bg-light-bg border-2 border-border-color rounded-full px-5 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50"
                    disabled={!newItemName.trim()}
                >
                    <PlusIcon />
                     <span>{t('shoppingList.add_button')}</span>
                </button>
            </form>
        </div>
    );
};

export default ShoppingList;