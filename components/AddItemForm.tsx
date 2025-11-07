

import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AddItemFormProps {
    onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
    onCancel: () => void;
}

const foodCategories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Drinks", "Other"];

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, onCancel }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState(foodCategories[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !expiryDate || !quantity) {
            alert('Please fill out all fields.');
            return;
        }
        onAddItem({ name, expiryDate, quantity, category });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">{t('addItem.name_label')}</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </div>
            <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-text-dark mb-1">{t('addItem.expiry_date_label')}</label>
                <input
                    type="date"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
            </div>
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-text-dark mb-1">{t('addItem.quantity_label')}</label>
                <input
                    type="text"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t('addItem.quantity_placeholder')}
                    className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-dark mb-1">{t('addItem.category_label')}</label>
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {foodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-light-bg text-text-light font-bold py-2 px-4 rounded-lg hover:bg-border-color transition-colors">
                    {t('addItem.cancel_button')}
                </button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                    {t('addItem.add_button')}
                </button>
            </div>
        </form>
    );
};

export default AddItemForm;
