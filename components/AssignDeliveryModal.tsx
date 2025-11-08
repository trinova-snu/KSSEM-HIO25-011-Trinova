import React, { useState, useEffect } from 'react';
import { CookedFoodOrder } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getDeliveryPersonNames } from '../services/geminiService';
import Modal from './Modal';
import { UserIcon } from './icons';

interface AssignDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: CookedFoodOrder;
    onAssign: (deliveryPerson: { name: string; phone: string }) => void;
    hotelLocation: string;
}

const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({ isOpen, onClose, order, onAssign, hotelLocation }) => {
    const { t } = useLanguage();
    const [deliveryPeople, setDeliveryPeople] = useState<{name: string, phone: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState<{name: string, phone: string} | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchNames = async () => {
                setIsLoading(true);
                try {
                    const names = await getDeliveryPersonNames(hotelLocation);
                    setDeliveryPeople(names);
                    if (names.length > 0) {
                        setSelectedPerson(names[0]);
                    }
                } catch (e) {
                    console.error("Failed to fetch delivery people:", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchNames();
        }
    }, [isOpen, hotelLocation]);
    
    const handleSubmit = () => {
        if (selectedPerson) {
            onAssign(selectedPerson);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('cookedFood.assign_delivery_modal_title')}>
            <div className="space-y-4">
                <p className="text-text-dark text-sm">Select a driver to deliver the order for <span className="font-bold text-text-light">{order.foodItemName}</span> to <span className="font-bold text-text-light">{order.orderedBy}</span>.</p>
                {isLoading ? (
                    <div className="h-24 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {deliveryPeople.map(person => (
                            <button
                                key={person.name}
                                onClick={() => setSelectedPerson(person)}
                                className={`w-full text-left p-3 rounded-lg border-2 flex items-center gap-3 transition-colors ${selectedPerson?.name === person.name ? 'bg-primary/20 border-primary' : 'bg-dark-bg border-border-color hover:border-primary/50'}`}
                            >
                                <UserIcon className="w-5 h-5 text-accent flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-text-light">{person.name}</p>
                                    <p className="text-xs text-text-dark">{person.phone}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-light-bg text-text-light font-bold py-2 px-4 rounded-lg hover:bg-border-color transition-colors">
                        {t('addItem.cancel_button')}
                    </button>
                    <button onClick={handleSubmit} disabled={!selectedPerson || isLoading} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
                        {t('cookedFood.confirm_assignment')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignDeliveryModal;
