import React, { useState, useMemo } from 'react';
import { DonationRequest, MembershipTier, FoodBankProfile, RequirementRequest, WasteHotspot } from '../types';
import { InfoIcon, TruckIcon, CheckCircleIcon, XCircleIcon, UsersIcon, AwardIcon, MegaphoneIcon, TargetIcon } from './icons';
import Modal from './Modal';
import DonationDetailModal from './DonationDetailModal';
import { useLanguage } from '../contexts/LanguageContext';
import RestaurantDetailModal from './RestaurantDetailModal';
import WasteHotspotMap from './WasteHotspotMap';
import HotelDetailModal from './HotelDetailModal';

const foodCategories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Drinks"];

interface FoodBankDashboardProps {
    requests: DonationRequest[];
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onComplete: (id: string) => void;
    foodBankProfile: FoodBankProfile | null;
    onCreateRequirementRequest: (requestData: Omit<RequirementRequest, 'id' | 'timestamp'>) => void;
    wasteHotspots: WasteHotspot[];
}

type View = 'pending' | 'active' | 'broadcast' | 'hotspots';

interface PartnerInfo {
    name: string;
    location: string;
}

const getMembershipTier = (donationCount: number): MembershipTier | null => {
    if (donationCount >= 25) return 'Diamond';
    if (donationCount >= 10) return 'Gold';
    if (donationCount >= 1) return 'Silver';
    return null;
};

const tierStyles: { [key in MembershipTier]: { bg: string; text: string; } } = {
    Silver: { bg: 'bg-gray-500/30', text: 'text-gray-300' },
    Gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300' },
    Diamond: { bg: 'bg-purple-400/30', text: 'text-purple-200' },
};

const BroadcastNeedsForm: React.FC<{ foodBankProfile: FoodBankProfile; onCreate: (data: Omit<RequirementRequest, 'id' | 'timestamp'>) => void; }> = ({ foodBankProfile, onCreate }) => {
    const { t } = useLanguage();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategories.length === 0) {
            alert('Please select at least one item category.');
            return;
        }
        onCreate({
            foodBankName: foodBankProfile.name,
            foodBankLocation: foodBankProfile.location,
            requestedItems: selectedCategories,
            message,
        });
        setSelectedCategories([]);
        setMessage('');
    };

    return (
        <div className="max-w-2xl mx-auto bg-light-bg p-8 rounded-2xl shadow-xl border border-border-color">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-light">{t('foodBank.broadcast_title')}</h2>
                <p className="text-text-dark mt-1">{t('foodBank.broadcast_desc')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">{t('foodBank.item_categories_label')}</label>
                    <div className="flex flex-wrap gap-3">
                        {foodCategories.map(cat => (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => handleCategoryToggle(cat)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${selectedCategories.includes(cat) ? 'bg-primary border-primary text-white' : 'bg-dark-bg border-border-color text-text-dark hover:border-primary'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-1">{t('foodBank.message_label')}</label>
                    <textarea
                        id="message"
                        rows={3}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={t('foodBank.message_placeholder')}
                        className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors">
                        <MegaphoneIcon />
                        {t('foodBank.broadcast_button')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FoodBankDashboard: React.FC<FoodBankDashboardProps> = ({ requests, onAccept, onDecline, onComplete, foodBankProfile, onCreateRequirementRequest, wasteHotspots }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<View>('pending');
    const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<PartnerInfo | null>(null);
    const [selectedHotspot, setSelectedHotspot] = useState<WasteHotspot | null>(null);
    const [highlightedHotspotId, setHighlightedHotspotId] = useState<string | null>(null);

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const activeShipments = requests.filter(r => r.status === 'accepted' || r.status === 'completed');

    const { restaurantPartners, partnerDonationCounts } = useMemo(() => {
        const partners = new Map<string, PartnerInfo>();
        const counts: { [key: string]: number } = {};

        requests.forEach(req => {
            if (!partners.has(req.restaurantName)) {
                partners.set(req.restaurantName, { name: req.restaurantName, location: req.location });
                counts[req.restaurantName] = 0;
            }
            if (req.status === 'completed') {
                if (!counts[req.restaurantName]) {
                     counts[req.restaurantName] = 0;
                }
                counts[req.restaurantName]++;
            }
        });
        return { 
            restaurantPartners: Array.from(partners.values()),
            partnerDonationCounts: counts,
        };
    }, [requests]);
    
    const completedDonationsForPartner = useMemo(() => {
        if (!selectedPartner) return [];
        return requests
            .filter(r => r.restaurantName === selectedPartner.name && r.status === 'completed')
            .sort((a, b) => new Date(b.donationDate!).getTime() - new Date(a.donationDate!).getTime());
    }, [requests, selectedPartner]);

    const renderRequestCard = (request: DonationRequest) => (
        <div key={request.id} className="bg-light-bg p-4 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-text-light">{request.restaurantName}</h3>
                        <p className="text-sm text-text-dark">{request.location}</p>
                        <p className="text-sm text-text-dark mt-1">{request.items.length} item types</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize 
                        ${request.status === 'pending' ? 'bg-warning/20 text-warning' : ''}
                        ${request.status === 'accepted' ? 'bg-secondary/20 text-secondary' : ''}
                        ${request.status === 'completed' ? 'bg-success/20 text-success' : ''}
                    `}>
                        {request.status}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                <button onClick={() => setSelectedRequest(request)} className="flex-1 bg-dark-bg text-text-light font-semibold py-2 px-3 rounded-md hover:bg-border-color transition-colors">View Details</button>
                {request.status === 'pending' && (
                    <>
                        <button onClick={() => onDecline(request.id)} className="bg-danger/20 text-danger p-2 rounded-md hover:bg-danger/40 transition-colors" title="Decline"><XCircleIcon /></button>
                        <button onClick={() => onAccept(request.id)} className="bg-success/20 text-success p-2 rounded-md hover:bg-success/40 transition-colors" title="Accept"><CheckCircleIcon /></button>
                    </>
                )}
                {request.status === 'accepted' && (
                    <button onClick={() => onComplete(request.id)} className="flex-1 bg-success text-white font-bold py-2 px-3 rounded-md hover:bg-green-600 transition-colors">Mark as Received</button>
                )}
            </div>
        </div>
    );
    
    const NavButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => {
        const activeClasses = "bg-primary text-white";
        const inactiveClasses = "bg-light-bg text-text-light hover:bg-border-color";
        return <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-full transition-colors ${active ? activeClasses : inactiveClasses}`}>{children}</button>
    }

    return (
        <div className="space-y-8">
            <div className="bg-dark-bg/50 p-2 rounded-full flex gap-2 max-w-2xl mx-auto border border-border-color">
                <NavButton active={view === 'pending'} onClick={() => setView('pending')}>
                    <InfoIcon /> {t('foodBank.pending_requests')}
                </NavButton>
                <NavButton active={view === 'active'} onClick={() => setView('active')}>
                    <TruckIcon /> {t('foodBank.active_shipments')}
                </NavButton>
                 <NavButton active={view === 'broadcast'} onClick={() => setView('broadcast')}>
                    <MegaphoneIcon /> {t('foodBank.broadcast_needs')}
                </NavButton>
                <NavButton active={view === 'hotspots'} onClick={() => setView('hotspots')}>
                    <TargetIcon /> {t('foodBank.waste_hotspots')}
                </NavButton>
            </div>
            
            <div>
                {view === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingRequests.length > 0 ? pendingRequests.map(renderRequestCard) : <p className="text-text-dark col-span-full text-center py-10">{t('foodBank.no_pending')}</p>}
                    </div>
                )}
                 {view === 'active' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeShipments.length > 0 ? activeShipments.map(renderRequestCard) : <p className="text-text-dark col-span-full text-center py-10">{t('foodBank.no_active')}</p>}
                    </div>
                )}
                {view === 'broadcast' && foodBankProfile && (
                    <BroadcastNeedsForm foodBankProfile={foodBankProfile} onCreate={onCreateRequirementRequest} />
                )}
                {view === 'hotspots' && foodBankProfile?.latitude && foodBankProfile?.longitude && (
                    <div className="bg-light-bg p-4 rounded-2xl shadow-xl border border-border-color">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-text-light">{t('foodBank.hotspot_title')}</h2>
                            <p className="text-text-dark mt-1 max-w-2xl mx-auto">{t('foodBank.hotspot_desc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
                            {/* Hotspots List */}
                            <div className="md:col-span-1 h-[500px] overflow-y-auto space-y-2 pr-2">
                                {wasteHotspots.length > 0 ? wasteHotspots.map(hotspot => (
                                    <button
                                        key={hotspot.id}
                                        onClick={() => setSelectedHotspot(hotspot)}
                                        onMouseEnter={() => setHighlightedHotspotId(hotspot.id)}
                                        onMouseLeave={() => setHighlightedHotspotId(null)}
                                        className={`w-full text-left p-3 rounded-md border-2 transition-all duration-200 ${
                                            highlightedHotspotId === hotspot.id
                                                ? 'bg-primary/20 border-primary ring-2 ring-primary'
                                                : 'bg-dark-bg/50 border-border-color hover:border-primary/50'
                                        }`}
                                    >
                                        <p className="font-semibold text-text-light">{hotspot.name}</p>
                                        <p className="text-xs text-text-dark truncate">{hotspot.address}</p>
                                        <p className="text-xs text-amber-400 font-bold mt-1">Waste Score: {hotspot.wasteScore}</p>
                                    </button>
                                )) : (
                                    <p className="text-text-dark text-center py-10">No hotspots found in this area.</p>
                                )}
                            </div>
                            {/* Map */}
                            <div className="md:col-span-2 h-[500px] w-full">
                                <WasteHotspotMap
                                    hotspots={wasteHotspots}
                                    centerCoords={{ latitude: foodBankProfile.latitude, longitude: foodBankProfile.longitude }}
                                    onSelectHotspot={setSelectedHotspot}
                                    highlightedHotspotId={highlightedHotspotId}
                                    onHoverHotspot={setHighlightedHotspotId}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-text-light border-b-2 border-primary/50 pb-2 mb-4 flex items-center gap-3">
                    <UsersIcon />
                    {t('foodBank.partners_header')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {restaurantPartners.map(partner => {
                        const donationCount = partnerDonationCounts[partner.name] || 0;
                        const tier = getMembershipTier(donationCount);
                        return (
                             <button 
                                key={partner.name} 
                                onClick={() => setSelectedPartner(partner)}
                                className="bg-light-bg p-4 rounded-lg border border-border-color text-left transform transition-all duration-200 hover:-translate-y-1 w-full flex flex-col justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-text-light">{partner.name}</p>
                                    <p className="text-xs text-text-dark">{partner.location}</p>
                                </div>
                                {tier && (
                                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tierStyles[tier].bg} ${tierStyles[tier].text}`}>
                                        <AwardIcon className="w-3 h-3" />
                                        <span>{t(`membership.${tier.toLowerCase()}`)}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedRequest && (
                <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={`${t('foodBank.donation_from')} ${selectedRequest.restaurantName}`}>
                    <DonationDetailModal request={selectedRequest} />
                </Modal>
            )}

            {selectedPartner && (
                <Modal isOpen={!!selectedPartner} onClose={() => setSelectedPartner(null)} title={t('foodBank.partner_details_title')}>
                    <RestaurantDetailModal 
                        partner={selectedPartner}
                        donationHistory={completedDonationsForPartner}
                        membershipTier={getMembershipTier(partnerDonationCounts[selectedPartner.name] || 0)}
                    />
                </Modal>
            )}

             {selectedHotspot && (
                <Modal isOpen={!!selectedHotspot} onClose={() => setSelectedHotspot(null)} title={selectedHotspot.name}>
                    <HotelDetailModal hotspot={selectedHotspot} />
                </Modal>
            )}

        </div>
    );
};

export default FoodBankDashboard;