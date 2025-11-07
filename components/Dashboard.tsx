import React, { useState } from 'react';
import { InventoryItem as InventoryItemType } from '../types';
import { ChartBarIcon, CalendarIcon, InfoIcon, SparklesIcon, TrashIcon, TrophyIcon, CloseIcon, ChefHatIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
    totalItems: number;
    expiringSoonCount: number;
    expiredCount: number;
    priorityItems: InventoryItemType[];
    onGetRecipes: (item: InventoryItemType) => void;
    onDeleteItem: (id: string) => void;
    expiringSoonItems: InventoryItemType[];
    isLoadingSmartPlate: boolean;
    onGenerateSmartPlate: (items: InventoryItemType[]) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; gradientClass: string }> = ({ title, value, icon, gradientClass }) => (
    <div className={`relative overflow-hidden bg-light-bg p-6 rounded-2xl shadow-lg border border-border-color ${gradientClass}`}>
        <div className="relative z-10 flex items-center gap-4">
            <div className="bg-dark-bg/50 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-text-dark font-medium">{title}</p>
                <p className="text-3xl font-bold text-text-light">{value}</p>
            </div>
        </div>
    </div>
);

const categoryEmojis: { [key: string]: string } = {
    Produce: '🥦',
    Dairy: '🥛',
    Meat: '🥩',
    Bakery: '🍞',
    Pantry: '🥫',
    Frozen: '❄️',
    Drinks: '🥤',
    Other: '🛒',
};

const PriorityItemCard: React.FC<{ item: InventoryItemType; onGetRecipes: () => void; onDelete: () => void; }> = ({ item, onGetRecipes, onDelete }) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(item.expiryDate);
    const daysLeft = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const expiryText = daysLeft < 0 
        ? `Expired ${Math.abs(daysLeft)} days ago` 
        : daysLeft === 0 
        ? 'Expires today' 
        : `Expires in ${daysLeft} days`;

    return (
        <div className="bg-light-bg p-4 rounded-xl border border-border-color flex items-center justify-between gap-4 transition-all hover:border-primary/80 hover:bg-light-bg/80 transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
                <div className="text-3xl bg-dark-bg/50 p-3 rounded-lg flex items-center justify-center w-16 h-16">
                    <span>{categoryEmojis[item.category] || '🛒'}</span>
                </div>
                <div>
                    <h4 className="font-bold text-text-light capitalize">{item.name}</h4>
                    <p className={`text-sm font-medium ${daysLeft <= 0 ? 'text-danger' : 'text-warning'}`}>
                        {expiryText}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={onGetRecipes} className="bg-dark-bg text-text-light p-2.5 rounded-full hover:bg-primary hover:text-white transition-colors" title="Get Recipes">
                    <SparklesIcon className="w-5 h-5"/>
                </button>
                <button onClick={onDelete} className="bg-dark-bg text-text-light p-2.5 rounded-full hover:bg-danger hover:text-white transition-colors" title="Delete Item">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ totalItems, expiringSoonCount, expiredCount, priorityItems, onGetRecipes, onDeleteItem, expiringSoonItems, isLoadingSmartPlate, onGenerateSmartPlate }) => {
    const { t } = useLanguage();
    const [showExpiryNotification, setShowExpiryNotification] = useState(true);
    
    return (
        <div className="space-y-8 animate-fade-in">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            
            {expiringSoonCount > 0 && showExpiryNotification && (
                <div className="bg-warning/20 border-l-4 border-warning text-warning p-4 rounded-r-lg flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-3" />
                        <p className="font-semibold">{t('dashboard.expiry_notification', { count: expiringSoonCount })}</p>
                    </div>
                    <button onClick={() => setShowExpiryNotification(false)} className="text-warning/70 hover:text-warning">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}

            <div>
                <h1 className="text-3xl font-bold text-text-light tracking-tighter">Welcome Back!</h1>
                <p className="text-text-dark">Here's a quick look at your pantry's health.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t('dashboard.total_items')} value={totalItems} icon={<ChartBarIcon className="w-8 h-8 text-secondary" />} gradientClass="bg-gradient-to-br from-secondary/10 to-light-bg" />
                <StatCard title={t('dashboard.expiring_soon')} value={expiringSoonCount} icon={<CalendarIcon className="w-8 h-8 text-warning" />} gradientClass="bg-gradient-to-br from-warning/10 to-light-bg" />
                <StatCard title={t('dashboard.expired_items')} value={expiredCount} icon={<InfoIcon className="w-8 h-8 text-danger" />} gradientClass="bg-gradient-to-br from-danger/10 to-light-bg" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Priority Items */}
                <div className="lg:col-span-2 space-y-4">
                     <h2 className="text-2xl font-bold text-text-light border-b-2 border-primary/50 pb-2">{t('dashboard.priority_items')}</h2>
                     {priorityItems.length > 0 ? (
                        <div className="space-y-3">
                            {priorityItems.map(item => (
                                <PriorityItemCard 
                                    key={item.id} 
                                    item={item}
                                    onGetRecipes={() => onGetRecipes(item)}
                                    onDelete={() => onDeleteItem(item.id)}
                                />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-10 px-4 bg-light-bg rounded-xl flex flex-col items-center border border-border-color">
                            <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                            <p className="text-text-dark">{t('dashboard.priority_empty')}</p>
                        </div>
                     )}
                </div>
                
                <div className="lg:sticky lg:top-24 space-y-8">
                    {expiringSoonItems.length > 0 && (
                        <div className="bg-gradient-to-br from-primary/10 via-light-bg to-light-bg p-6 rounded-2xl shadow-lg border border-border-color text-center">
                            <div className="mx-auto bg-primary/20 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                <ChefHatIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text-light">{t('dashboard.meal_plan_card_title')}</h3>
                            <p className="text-text-dark mt-1 mb-4 text-sm">{t('dashboard.meal_plan_card_desc')}</p>
                            <button
                                onClick={() => onGenerateSmartPlate(expiringSoonItems)}
                                disabled={isLoadingSmartPlate}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isLoadingSmartPlate ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon className="w-5 h-5" />
                                )}
                                <span>{isLoadingSmartPlate ? 'Generating...' : t('dashboard.generate_meal_plan_button')}</span>
                            </button>
                        </div>
                    )}
                    
                    {/* Waste Reduction Tracker */}
                    <div className="bg-gradient-to-br from-green-500/10 via-light-bg to-light-bg p-6 rounded-2xl shadow-lg border border-border-color text-center">
                        <div className="mx-auto bg-accent/20 text-accent p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <TrophyIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-text-light">{t('dashboard.tracker_title')}</h3>
                        <p className="text-text-dark mt-1 mb-4 text-sm">{t('dashboard.tracker_desc_alt')}</p>
                        <div className="bg-dark-bg p-2 rounded-full inline-flex items-center gap-2">
                            <span className="bg-accent text-dark-bg font-black text-2xl rounded-full w-10 h-10 flex items-center justify-center">5</span>
                            <span className="font-semibold text-text-light pr-3">{t('dashboard.items_saved')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;