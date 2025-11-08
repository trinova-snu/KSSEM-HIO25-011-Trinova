import React from 'react';
import { CookedFoodItem, CookedFoodOrder } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, FireIcon, InfoIcon, ChefHatIcon, UserIcon } from './icons';

interface LiveCookedFoodOrdersProps {
    announcedItems: CookedFoodItem[];
    orders: CookedFoodOrder[];
    onAnnounce: () => void;
    onUpdateStatus: (orderId: string, status: CookedFoodOrder['status']) => void;
    onAssignDelivery: (order: CookedFoodOrder) => void;
}

const statusStyles = {
    placed: 'bg-blue-500/20 text-blue-300',
    preparing: 'bg-yellow-500/20 text-yellow-300',
    out_for_delivery: 'bg-orange-500/20 text-orange-300',
    delivered: 'bg-green-500/20 text-green-300',
};


const LiveCookedFoodOrders: React.FC<LiveCookedFoodOrdersProps> = ({ announcedItems, orders, onAnnounce, onUpdateStatus, onAssignDelivery }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-light tracking-tighter flex items-center gap-3"><FireIcon/> {t('hotelPantry.flash_donations')}</h1>
                <button
                    onClick={onAnnounce}
                    className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 transform hover:scale-105"
                >
                    <PlusIcon />
                    <span className="hidden sm:inline">{t('hotelPantry.announce_food')}</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Announcements */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-light border-b-2 border-primary/50 pb-2">Active Announcements</h2>
                     {announcedItems.length > 0 ? (
                        announcedItems.map(item => (
                            <div key={item.id} className="bg-light-bg p-4 rounded-lg border border-border-color">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-text-light">{item.name}</h3>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${item.status === 'available' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-text-dark">{item.quantity}</p>
                                <p className="text-xs text-text-dark/70 mt-1">Order by: {item.availableUntil}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 px-4 bg-light-bg rounded-lg border border-border-color flex flex-col items-center">
                            <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                            <p className="text-text-dark">{t('hotelPantry.no_announcements')}</p>
                        </div>
                    )}
                </div>

                {/* Live Orders */}
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-light border-b-2 border-primary/50 pb-2">{t('cookedFood.live_orders_title')}</h2>
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.id} className="bg-light-bg p-4 rounded-lg border border-border-color">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-text-light">{order.foodItemName}</h3>
                                        <p className="text-sm text-text-dark flex items-center gap-2"><UserIcon className="w-4 h-4"/>{order.orderedBy}</p>
                                    </div>
                                     <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                                        {t(`cookedFood.status_${order.status}`)}
                                    </span>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    {order.status === 'placed' && (
                                        <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="flex-1 bg-secondary text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-blue-500 transition-colors">
                                            {t('cookedFood.accept_order')}
                                        </button>
                                    )}
                                     {order.status === 'preparing' && (
                                        <button onClick={() => onAssignDelivery(order)} className="flex-1 bg-secondary text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-blue-500 transition-colors">
                                            {t('cookedFood.assign_delivery')}
                                        </button>
                                    )}
                                     {order.status === 'out_for_delivery' && (
                                        <button onClick={() => onUpdateStatus(order.id, 'delivered')} className="flex-1 bg-success text-white font-semibold py-2 px-3 text-sm rounded-md hover:bg-green-600 transition-colors">
                                            {t('cookedFood.mark_delivered')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 px-4 bg-light-bg rounded-lg border border-border-color flex flex-col items-center">
                             <ChefHatIcon className="w-8 h-8 text-secondary mb-3"/>
                            <p className="text-text-dark">{t('cookedFood.no_live_orders')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveCookedFoodOrders;
