import React from 'react';
import { DonationRequest } from '../types';
import { CalendarIcon, CubeIcon } from './icons';

interface DonationDetailModalProps {
    request: DonationRequest;
}

const DonationDetailModal: React.FC<DonationDetailModalProps> = ({ request }) => {
    return (
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
                {request.items.map(item => (
                    <div key={item.id} className="bg-dark-bg p-3 rounded-lg border border-border-color">
                        <h4 className="font-bold text-text-light capitalize">{item.name}</h4>
                        <div className="text-xs text-text-dark mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <CubeIcon className="w-3 h-3 text-accent" />
                                <span>Quantity: {item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3 text-accent" />
                                <span>Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonationDetailModal;
