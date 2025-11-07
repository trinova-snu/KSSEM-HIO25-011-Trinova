import React from 'react';
import { MembershipTier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AwardIcon } from './icons';

interface MembershipCardProps {
    tier: MembershipTier;
}

const tierStyles: { [key in MembershipTier]: { bgGradient: string; text: string; icon: string; shadow: string } } = {
    Silver: { bgGradient: 'from-gray-700 to-gray-800', text: 'text-gray-200', icon: 'text-gray-300', shadow: 'shadow-gray-900/50' },
    Gold: { bgGradient: 'from-yellow-600 to-yellow-800', text: 'text-yellow-100', icon: 'text-yellow-300', shadow: 'shadow-yellow-900/50' },
    Diamond: { bgGradient: 'from-purple-600 to-purple-800', text: 'text-purple-100', icon: 'text-purple-300', shadow: 'shadow-purple-900/50' },
};


const MembershipCard: React.FC<MembershipCardProps> = ({ tier }) => {
    const { t } = useLanguage();
    const styles = tierStyles[tier];
    
    return (
        <div className={`bg-gradient-to-br ${styles.bgGradient} p-4 rounded-xl shadow-lg ${styles.shadow} border border-white/10 flex items-center justify-between`}>
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80 ${styles.text}">{t('membership.status')}</p>
                <p className={`text-2xl font-bold ${styles.text}`}>
                    {t(`membership.${tier.toLowerCase()}`)}
                </p>
            </div>
            <div className={`p-3 bg-black/20 rounded-full ${styles.icon}`}>
                <AwardIcon className="w-8 h-8" />
            </div>
        </div>
    );
};

export default MembershipCard;
