import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AwardIcon } from './icons';

interface BadgesProps {
    donationCount: number;
}

const badgeTiers = [
    { name: 'bronze', threshold: 1, color: 'text-orange-400' },
    { name: 'silver', threshold: 5, color: 'text-gray-300' },
    { name: 'gold', threshold: 10, color: 'text-yellow-400' },
    { name: 'platinum', threshold: 25, color: 'text-blue-300' },
    { name: 'diamond', threshold: 50, color: 'text-purple-300' },
];

const Badges: React.FC<BadgesProps> = ({ donationCount }) => {
    const { t } = useLanguage();

    const unlockedBadges = badgeTiers.filter(b => donationCount >= b.threshold);
    const nextBadgeIndex = unlockedBadges.length;
    const nextBadge = nextBadgeIndex < badgeTiers.length ? badgeTiers[nextBadgeIndex] : null;
    
    const progress = nextBadge
        ? (donationCount / nextBadge.threshold) * 100
        : 100;

    const donationsForNext = nextBadge ? nextBadge.threshold - donationCount : 0;

    return (
        <div className="bg-light-bg/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-border-color/50">
            <h2 className="text-2xl font-bold text-text-light mb-4">{t('badges.title')}</h2>
            
            <div className="flex justify-center items-center gap-6 mb-6">
                {badgeTiers.map(badge => (
                    <div key={badge.name} className={`transition-all duration-300 ${donationCount >= badge.threshold ? 'opacity-100 transform scale-110' : 'opacity-30'}`} title={`${t(`badges.${badge.name}`)} (${badge.threshold}+ ${t('badges.donations')})`}>
                        <AwardIcon className={`w-12 h-12 ${badge.color}`} />
                    </div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-text-light font-bold text-3xl">{donationCount}</p>
                <p className="text-text-dark text-sm">{t('badges.donations')}</p>
            </div>

            {nextBadge && (
                <div className="mt-4">
                    <div className="w-full bg-dark-bg rounded-full h-2.5">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-xs text-text-dark mt-2">
                        <span className="font-bold text-primary">{donationsForNext}</span> {t('badges.next_badge')} ({t(`badges.${nextBadge.name}`)})
                    </p>
                </div>
            )}
        </div>
    );
};

export default Badges;
