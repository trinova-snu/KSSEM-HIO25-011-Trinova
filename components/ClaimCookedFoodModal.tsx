import React, { useState } from 'react';
import { CookedFoodItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';
import { ChefHatIcon, MapPinIcon } from './icons';

interface ClaimCookedFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    foodItem: CookedFoodItem | null;
    onClaim: (details: { address: string; contact: string }) => void;
}

const ClaimCookedFoodModal: React.FC<ClaimCookedFoodModalProps> = ({ isOpen, onClose, foodItem, onClaim }) => {
    const { t } = useLanguage();
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    
    if (!foodItem) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address || !contact) {
            alert('Please provide delivery address and contact number.');
            return;
        }
        onClaim({ address, contact });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('cookedFood.claim_modal_title')}>
            <div className="mb-4 bg-dark-bg p-4 rounded-lg border border-border-color">
                <h3 className="text-lg font-bold text-primary">{foodItem.name}</h3>
                <div className="flex items-center gap-2 text-sm text-text-dark mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{foodItem.hotelName}</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-text-dark mt-1">
                    <ChefHatIcon className="w-4 h-4" />
                    <span>{t('dashboard.serves', { count: foodItem.quantity })}</span>
                </div>
            </div>
            
            <p className="text-sm text-text-dark mb-4">{t('cookedFood.claim_confirm_message')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="delivery-address" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.delivery_address_label')}</label>
                    <textarea id="delivery-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required></textarea>
                </div>
                <div>
                    <label htmlFor="contact-number" className="block text-sm font-medium text-text-dark mb-1">{t('cookedFood.contact_number_label')}</label>
                    <input type="tel" id="contact-number" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-light-bg text-text-light font-bold py-2 px-4 rounded-lg hover:bg-border-color transition-colors">
                        {t('addItem.cancel_button')}
                    </button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                        {t('cookedFood.place_order_button')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ClaimCookedFoodModal;
