import React from 'react';
import { CookedFoodOrder } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PackageIcon, MapPinIcon, TruckIcon } from './icons';

interface CookedFoodOrdersPageProps {
    orders: CookedFoodOrder[];
    onTrackOrder: (order: CookedFoodOrder) => void;
}

const statusStyles = {
    placed: 'bg-blue-500/20 text-blue-300',
    preparing: 'bg-yellow-500/20 text-yellow-300',
    out_for_delivery: 'bg-orange-500/20 text-orange-300',
    delivered: 'bg-green-500/20 text-green-300',
};

const CookedFoodOrdersPage: React.FC<CookedFoodOrdersPageProps> = ({ orders, onTrackOrder }) => {
    const { t } = useLanguage();

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-light-bg rounded-xl shadow-lg flex flex-col items-center border border-border-color">
                <PackageIcon className="w-12 h-12 text-secondary mb-4" />
                <h2 className="text-2xl font-bold text-text-light mb-2">{t('cookedFood.no_orders')}</h2>
                <p className="text-text-dark max-w-md">{t('dashboard.available_today')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-light tracking-tighter">{t('cookedFood.my_orders_title')}</h1>
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-light-bg p-4 rounded-lg border border-border-color flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-text-light">{order.foodItemName}</h3>
                                 <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                                    {t(`cookedFood.status_${order.status}`)}
                                </span>
                            </div>
                            <p className="text-sm text-text-dark flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> {order.hotelName}, {order.hotelLocation}</p>
                            <p className="text-xs text-text-dark/70 mt-1">
                                {t('cookedFood.order_id')}: {order.orderId}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => onTrackOrder(order)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 transition-colors"
                            >
                                <TruckIcon className="w-5 h-5" />
                                <span>{t('track_order_title', { orderId: '' }).trim()}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CookedFoodOrdersPage;
