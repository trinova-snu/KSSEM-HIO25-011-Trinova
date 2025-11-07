import React from 'react';
import { UserIcon, BuildingIcon, HandHeartIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface WelcomeProps {
    onSelectPublic: () => void;
    onSelectHotel: () => void;
    onSelectFoodBank: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSelectPublic, onSelectHotel, onSelectFoodBank }) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="text-center mb-12">
                 <span className="text-6xl mb-4 inline-block">🛒</span>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-primary">
                    {t('welcome.title')}
                </h1>
                <p className="text-text-dark mt-2 text-lg">{t('welcome.subtitle')}</p>
            </div>

            <div className="w-full max-w-sm text-center">
                <h2 className="text-xl font-bold text-text-light mb-6">{t('welcome.join_prompt')}</h2>
                <div className="space-y-4">
                    <button
                        onClick={onSelectPublic}
                        className="w-full flex items-center gap-4 text-left bg-light-bg border border-border-color hover:border-primary p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <UserIcon className="w-8 h-8 text-primary flex-shrink-0"/>
                        <div>
                            <span className="font-bold text-lg text-text-light">{t('welcome.public_user')}</span>
                            <p className="text-sm text-text-dark">{t('welcome.public_desc_personalized')}</p>
                        </div>
                    </button>
                    <button
                        onClick={onSelectHotel}
                        className="w-full flex items-center gap-4 text-left bg-light-bg border border-border-color hover:border-primary p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                         <BuildingIcon className="w-8 h-8 text-primary flex-shrink-0"/>
                         <div>
                            <span className="font-bold text-lg text-text-light">{t('welcome.hotel_user')}</span>
                            <p className="text-sm text-text-dark">{t('welcome.hotel_desc')}</p>
                        </div>
                    </button>
                     <button
                        onClick={onSelectFoodBank}
                        className="w-full flex items-center gap-4 text-left bg-light-bg border border-border-color hover:border-primary p-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                         <HandHeartIcon className="w-8 h-8 text-primary flex-shrink-0"/>
                         <div>
                            <span className="font-bold text-lg text-text-light">{t('welcome.food_bank_user')}</span>
                            <p className="text-sm text-text-dark">{t('welcome.food_bank_desc')}</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
