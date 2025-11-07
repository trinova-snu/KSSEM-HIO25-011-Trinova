import React from 'react';
import { WasteHotspot } from '../types';
import { MapPinIcon, MailIcon, PhoneIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HotelDetailModalProps {
    hotspot: WasteHotspot;
}

const HotelDetailModal: React.FC<HotelDetailModalProps> = ({ hotspot }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center gap-2 text-sm text-text-dark">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{hotspot.address}</span>
                </div>
            </div>

            <div className="p-4 bg-dark-bg rounded-lg border border-border-color">
                <h4 className="font-semibold text-text-light mb-3">{t('foodBank.contact_details')}</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <MailIcon className="w-5 h-5 text-accent" />
                        <a href={`mailto:${hotspot.contactEmail}`} className="text-text-light hover:text-primary hover:underline">{hotspot.contactEmail}</a>
                    </div>
                     <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-accent" />
                        <a href={`tel:${hotspot.contactPhone}`} className="text-text-light hover:text-primary hover:underline">{hotspot.contactPhone}</a>
                    </div>
                </div>
            </div>
            
             <div className="pt-4 text-center">
                 <p className="text-sm text-text-dark mb-4">{t('foodBank.contact_prompt')}</p>
                <button className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                    {t('foodBank.contact_button')}
                </button>
            </div>
        </div>
    );
};

export default HotelDetailModal;