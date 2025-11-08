import React, { useEffect, useState } from 'react';
import { CookedFoodOrder } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';
import { CheckCircleIcon, ChefHatIcon, PackageIcon, PhoneIcon, TruckIcon, UserIcon } from './icons';

interface TrackOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: CookedFoodOrder | null;
}

const statusSteps = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose, order }) => {
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if(isOpen) {
            const timer = setInterval(() => setCurrentTime(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!order) return null;

    const currentStatusIndex = statusSteps.indexOf(order.status);

    const getEstimatedTime = () => {
        if (!order.estimatedDeliveryTime) return '...';
        const estDate = new Date(order.estimatedDeliveryTime);
        if (order.status === 'delivered') {
            return `at ${estDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (estDate < currentTime) {
            return "Arriving soon";
        }
        return `by ${estDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const StatusStep: React.FC<{ icon: React.ReactNode, title: string, isCompleted: boolean, isActive: boolean }> = ({ icon, title, isCompleted, isActive }) => {
        const circleClass = isCompleted ? 'bg-success' : isActive ? 'bg-primary' : 'bg-border-color';
        const textClass = isCompleted || isActive ? 'text-text-light' : 'text-text-dark';
        return (
            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${circleClass} transition-colors`}>
                    {isCompleted ? <CheckCircleIcon className="w-6 h-6 text-white"/> : icon}
                </div>
                <p className={`mt-2 text-sm font-semibold text-center ${textClass}`}>{title}</p>
            </div>
        )
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t('cookedFood.track_order_title')} - #${order.orderId}`}>
            <div className="space-y-6">
                <div className="bg-dark-bg p-4 rounded-lg text-center border border-border-color">
                    <p className="text-text-dark text-sm uppercase tracking-wider">{order.status === 'delivered' ? 'Delivered' : 'Estimated Arrival'}</p>
                    <p className="text-primary font-bold text-2xl">{getEstimatedTime()}</p>
                </div>
                
                <div className="relative flex justify-between items-start">
                     <div className="absolute top-6 left-0 w-full h-1 bg-border-color">
                        <div 
                            className="h-1 bg-primary transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`}}
                        ></div>
                    </div>
                    <StatusStep icon={<PackageIcon className="w-6 h-6 text-white"/>} title={t('cookedFood.status_placed')} isCompleted={currentStatusIndex > 0} isActive={currentStatusIndex === 0} />
                    <StatusStep icon={<ChefHatIcon className="w-6 h-6 text-white"/>} title={t('cookedFood.status_preparing')} isCompleted={currentStatusIndex > 1} isActive={currentStatusIndex === 1} />
                    <StatusStep icon={<TruckIcon className="w-6 h-6 text-white"/>} title={t('cookedFood.status_out_for_delivery')} isCompleted={currentStatusIndex > 2} isActive={currentStatusIndex === 2} />
                    <StatusStep icon={<CheckCircleIcon className="w-6 h-6 text-white"/>} title={t('cookedFood.status_delivered')} isCompleted={currentStatusIndex === 3} isActive={currentStatusIndex === 3} />
                </div>
                
                {order.deliveryPerson && (
                    <div>
                        <h4 className="font-semibold text-lg text-primary mb-2">{t('cookedFood.delivery_details')}</h4>
                        <div className="bg-dark-bg p-4 rounded-lg border border-border-color flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-6 h-6 text-accent"/>
                                <div>
                                    <p className="text-text-dark text-sm">{t('cookedFood.delivery_person')}</p>
                                    <p className="font-semibold text-text-light">{order.deliveryPerson.name}</p>
                                </div>
                            </div>
                            <a href={`tel:${order.deliveryPerson.phone}`} className="p-3 bg-secondary rounded-full text-white hover:bg-blue-500">
                                <PhoneIcon className="w-5 h-5"/>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TrackOrderModal;
