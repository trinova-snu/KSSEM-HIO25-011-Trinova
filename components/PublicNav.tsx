import React from 'react';
import { DashboardIcon, ListIcon, BotIcon, ShoppingCartIcon, BrainCircuitIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

type PublicView = 'dashboard' | 'inventory' | 'healthbot' | 'shopping-list' | 'knowledge';

interface PublicNavProps {
    activeView: PublicView;
    setView: (view: PublicView) => void;
}

const PublicNav: React.FC<PublicNavProps> = ({ activeView, setView }) => {
    const { t } = useLanguage();
    const commonClasses = "flex items-center gap-2 font-bold py-2 px-4 rounded-full transition-all duration-200 text-sm md:text-base";
    const activeClasses = "bg-primary text-white";
    const inactiveClasses = "bg-light-bg text-text-light hover:bg-border-color";

    return (
        <div className="bg-dark-bg/50 p-2 rounded-full flex gap-2 max-w-xl mx-auto border border-border-color">
            <button
                onClick={() => setView('dashboard')}
                className={`${commonClasses} ${activeView === 'dashboard' ? activeClasses : inactiveClasses} flex-1 justify-center`}
            >
                <DashboardIcon className="w-5 h-5" />
                <span>{t('nav.dashboard')}</span>
            </button>
            <button
                onClick={() => setView('inventory')}
                className={`${commonClasses} ${activeView === 'inventory' ? activeClasses : inactiveClasses} flex-1 justify-center`}
            >
                <ListIcon className="w-5 h-5" />
                <span>{t('nav.inventory')}</span>
            </button>
            <button
                onClick={() => setView('shopping-list')}
                className={`${commonClasses} ${activeView === 'shopping-list' ? activeClasses : inactiveClasses} flex-1 justify-center`}
            >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{t('nav.shopping_list')}</span>
            </button>
             <button
                onClick={() => setView('knowledge')}
                className={`${commonClasses} ${activeView === 'knowledge' ? activeClasses : inactiveClasses} flex-1 justify-center`}
            >
                <BrainCircuitIcon className="w-5 h-5" />
                <span>{t('nav.knowledge')}</span>
            </button>
        </div>
    );
};

export default PublicNav;