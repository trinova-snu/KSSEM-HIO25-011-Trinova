import React, { useState } from 'react';
import { CookedFoodItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';

interface AnnounceCookedFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnnounce: (item: Omit<CookedFoodItem, 'id' | 'hotelName' | 'hotelLocation' | 'hotelId' | 'status'>) => void;
}

const AnnounceCookedFoodModal: React.FC<AnnounceCookedFoodModalProps> = ({ isOpen, onClose, onAnnounce }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [allergens, setAllergens] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !quantity || !availableUntil) {
            alert('Please fill out all required fields.');
            return;
        }
        onAnnounce({ name, description, quantity, allergens, availableUntil });
        // Reset form
        setName('');
        setDescription('');
        setQuantity('');
        setAllergens('');
        setAvailableUntil('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('cookedFood.announce_modal_title')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="food-name" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.food_name_label')}</label>
                    <input type="text" id="food-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('cookedFood.food_name_placeholder')} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label htmlFor="food-desc" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.description_label')}</label>
                    <textarea id="food-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('cookedFood.description_placeholder')} rows={2} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required></textarea>
                </div>
                <div>
                    <label htmlFor="food-qty" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.quantity_label')}</label>
                    <input type="text" id="food-qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('cookedFood.quantity_placeholder')} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                 <div>
                    <label htmlFor="food-allergens" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.allergens_label')}</label>
                    <input type="text" id="food-allergens" value={allergens} onChange={(e) => setAllergens(e.target.value)} placeholder={t('cookedFood.allergens_placeholder')} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                 <div>
                    <label htmlFor="food-time" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.available_until_label')}</label>
                    <input type="time" id="food-time" value={availableUntil} onChange={(e) => setAvailableUntil(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-light-bg text-text-light font-bold py-2 px-4 rounded-lg hover:bg-border-color transition-colors">
                        {t('addItem.cancel_button')}
                    </button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                        {t('cookedFood.announce_button')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AnnounceCookedFoodModal;
