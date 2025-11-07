import React from 'react';
import { PlusIcon, BuildingIcon, SettingsIcon, UserIcon, CameraIcon, HandHeartIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    onAddItem: () => void;
    onScanBill: () => void;
    onOpenSettings: () => void;
    onOpenProfile: () => void;
    userType: 'public' | 'hotel' | 'food-bank' | null;
    userName?: string;
}

const Header: React.FC<HeaderProps> = ({ onAddItem, onScanBill, onOpenSettings, onOpenProfile, userType, userName }) => {
    const { t } = useLanguage();
    
    return (
        <header className="bg-light-bg/50 backdrop-blur-sm sticky top-0 z-10 border-b border-border-color">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🛒</span>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-primary">
                        PANTRIX
                    </h1>
                </div>

                {userName && (
                    <div className="hidden md:flex items-center gap-2 text-text-dark">
                        {userType === 'hotel' && <BuildingIcon className="w-5 h-5" />}
                        {userType === 'food-bank' && <HandHeartIcon className="w-5 h-5" />}
                        <span className="font-semibold">{userName}</span>
                    </div>
                )}


                <div className="flex items-center gap-3">
                    {userType !== 'food-bank' && (
                        <>
                            <button
                                onClick={onScanBill}
                                className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <CameraIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">{t('header.scan_bill')}</span>
                            </button>
                            <button
                                onClick={onAddItem}
                                className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 transform hover:scale-105"
                            >
                                <PlusIcon />
                                <span className="hidden sm:inline">{t('header.add_item')}</span>
                            </button>
                        </>
                    )}
                     <button
                        onClick={onOpenSettings}
                        className="flex items-center justify-center bg-light-bg text-text-light font-semibold p-2.5 rounded-full hover:bg-border-color transition-all duration-200"
                        title="Settings"
                    >
                        <SettingsIcon />
                    </button>
                    <button
                        onClick={onOpenProfile}
                        className="flex items-center justify-center bg-light-bg text-text-light font-semibold p-2.5 rounded-full hover:bg-border-color transition-all duration-200"
                        title="Profile"
                    >
                        <UserIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;