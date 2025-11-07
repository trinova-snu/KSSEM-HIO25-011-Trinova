import React from 'react';
import { DonationRequest, MembershipTier } from '../types';
import { MapPinIcon, CalendarIcon, CubeIcon, InfoIcon, AwardIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface RestaurantDetailModalProps {
    partner: { name: string; location: string };
    donationHistory: DonationRequest[];
    membershipTier: MembershipTier | null;
}

const tierStyles: { [key in MembershipTier]: { bg: string; text: string; } } = {
    Silver: { bg: 'bg-gray-500/30', text: 'text-gray-300' },
    Gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300' },
    Diamond: { bg: 'bg-purple-400/30', text: 'text-purple-200' },
};


const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({ partner, donationHistory, membershipTier }) => {
    const { t } = useLanguage();

    return (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-primary">{partner.name}</h3>
                     {membershipTier && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${tierStyles[membershipTier].bg} ${tierStyles[membershipTier].text}`}>
                            <AwardIcon className="w-4 h-4" />
                            <span>{t(`membership.${membershipTier.toLowerCase()}`)}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-dark mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{partner.location}</span>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-lg text-text-light mb-3 border-b border-border-color pb-2">
                    {t('restaurantDetail.history_title')}
                </h4>
                {donationHistory.length > 0 ? (
                    <div className="space-y-3">
                        {donationHistory.map(donation => (
                            <div key={donation.id} className="bg-dark-bg p-3 rounded-lg border border-border-color">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-text-light">
                                        <CalendarIcon className="w-4 h-4 text-accent" />
                                        <span>{new Date(donation.donationDate!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-dark">
                                        <CubeIcon className="w-3 h-3" />
                                        <span>{donation.items.length} {t('restaurantDetail.item_types')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4 bg-dark-bg rounded-lg flex flex-col items-center border border-border-color">
                        <InfoIcon className="w-8 h-8 text-secondary mb-3"/>
                        <p className="text-text-dark">{t('restaurantDetail.no_history')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetailModal;