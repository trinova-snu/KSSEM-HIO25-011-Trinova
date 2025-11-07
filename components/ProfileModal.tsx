import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserIcon, BuildingIcon, HandHeartIcon, LogoutIcon, EditIcon, TrophyIcon, MapPinIcon, AwardIcon } from './icons';
import { MembershipTier } from '../types';

type UserType = 'public' | 'hotel' | 'food-bank';

interface ProfileModalProps {
    onClose: () => void;
    onLogout: () => void;
    onEditProfile: () => void;
    userType: UserType;
    userName: string;
    userEmail: string;
    userLocation?: string;
    itemsSaved?: number;
    membershipTier?: MembershipTier | null;
}

const tierStyles: { [key in MembershipTier]: { bg: string; text: string; } } = {
    Silver: { bg: 'bg-gray-500/30', text: 'text-gray-300' },
    Gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300' },
    Diamond: { bg: 'bg-purple-400/30', text: 'text-purple-200' },
};

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onLogout, onEditProfile, userType, userName, userEmail, userLocation, itemsSaved, membershipTier }) => {
    const { t } = useLanguage();

    const renderAvatar = () => {
        const iconProps = { className: "w-12 h-12 text-primary" };
        switch (userType) {
            case 'public': return <UserIcon {...iconProps} />;
            case 'hotel': return <BuildingIcon {...iconProps} />;
            case 'food-bank': return <HandHeartIcon {...iconProps} />;
            default: return null;
        }
    };

    const renderUserDetails = () => (
        <div className="text-center">
            <h3 className="text-xl font-bold text-text-light">{userName}</h3>
            {userType === 'hotel' && membershipTier && (
                <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${tierStyles[membershipTier].bg} ${tierStyles[membershipTier].text}`}>
                    <AwardIcon className="w-4 h-4" />
                    <span>{t(`membership.${membershipTier.toLowerCase()}`)}</span>
                </div>
            )}
            <p className="text-sm text-text-dark mt-1">{userEmail}</p>
            {userLocation && (
                 <div className="flex items-center justify-center gap-2 text-sm text-text-dark mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{userLocation}</span>
                </div>
            )}
        </div>
    );
    
    const renderStats = () => {
        if (userType !== 'public' || itemsSaved === undefined) return null;
        return (
             <div className="bg-dark-bg p-4 rounded-lg mt-4 border border-border-color">
                <div className="flex items-center justify-center gap-4">
                     <TrophyIcon className="w-8 h-8 text-accent" />
                    <div>
                         <p className="font-bold text-lg text-text-light">{itemsSaved}</p>
                         <p className="text-sm text-text-dark">{t('profile.items_saved')}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-light-bg p-4 rounded-full border-2 border-border-color">
                    {renderAvatar()}
                </div>
                {renderUserDetails()}
            </div>
            
            {renderStats()}

            <div className="flex flex-col space-y-3 pt-4">
                <button onClick={onEditProfile} className="w-full flex items-center justify-center gap-2 bg-light-bg text-text-light font-bold py-3 px-4 rounded-lg hover:bg-border-color transition-colors">
                    <EditIcon className="w-5 h-5"/>
                    {t('profile.edit_profile')}
                </button>
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 bg-danger/20 text-danger font-bold py-3 px-4 rounded-lg hover:bg-danger/40 transition-colors"
                >
                    <LogoutIcon className="w-5 h-5" />
                    {t('profile.logout')}
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;