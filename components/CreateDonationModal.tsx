import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '../types';
import { getNearbyFoodBanks } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, PackageIcon, SearchIcon, TruckIcon, AlertTriangleIcon, MapPinIcon } from './icons';
import { NgoWithCoords, GeoLocation } from '../services/geminiService';
import NgoMap from './NgoMap';

interface CreateDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    preselectedItems: InventoryItem[];
    restaurantLocation: string;
    restaurantCoords?: GeoLocation;
    onCreateDonation: (donationDetails: {
        itemsToDonate: InventoryItem[];
        ngoName: string;
        deliveryType: 'pickup' | 'dropoff';
        pickupDateTime?: string;
        notes?: string;
    }) => void;
}

const CreateDonationModal: React.FC<CreateDonationModalProps> = ({ isOpen, onClose, inventory, preselectedItems, restaurantLocation, restaurantCoords, onCreateDonation }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [ngos, setNgos] = useState<NgoWithCoords[]>([]);
    const [isLoadingNgos, setIsLoadingNgos] = useState(true);
    const [errorNgos, setErrorNgos] = useState<string | null>(null);

    const [selectedNgo, setSelectedNgo] = useState<NgoWithCoords | null>(null);
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'dropoff'>('pickup');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            const preselectedIds = new Set(preselectedItems.map(item => item.id));
            setSelectedItemIds(preselectedIds);
            
            setStep(1);
            setSelectedNgo(null);
            setDeliveryType('pickup');
            setPickupDate('');
            setPickupTime('');
            setNotes('');
            setSearchQuery('');

            const fetchNgos = async () => {
                setIsLoadingNgos(true);
                setErrorNgos(null);
                try {
                    const fetchedNgos = await getNearbyFoodBanks(restaurantLocation);
                    setNgos(fetchedNgos);
                    if (fetchedNgos.length > 0) {
                        setSelectedNgo(fetchedNgos[0]);
                    }
                } catch (err) {
                    setErrorNgos("Could not load nearby food banks. Please try again later.");
                    console.error(err);
                } finally {
                    setIsLoadingNgos(false);
                }
            };
            fetchNgos();
        }
    }, [isOpen, preselectedItems, restaurantLocation]);

    const handleItemToggle = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [inventory, searchQuery]);
    
    const itemsToDonate = useMemo(() => {
        return inventory.filter(item => selectedItemIds.has(item.id));
    }, [inventory, selectedItemIds]);

    const handlePreview = () => {
        if (selectedItemIds.size === 0) {
            alert('Please select at least one item to donate.');
            return;
        }
        if (!selectedNgo) {
            alert('Please select an NGO to donate to.');
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        const pickupDateTime = deliveryType === 'pickup' && pickupDate && pickupTime
            ? `${pickupDate}T${pickupTime}`
            : undefined;

        onCreateDonation({
            itemsToDonate,
            ngoName: selectedNgo!.name,
            deliveryType,
            pickupDateTime,
            notes,
        });
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-light-bg w-full max-w-4xl rounded-2xl shadow-2xl border border-border-color transform transition-all duration-300 scale-95 animate-modal-enter flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border-color flex-shrink-0">
                    <h2 className="text-xl font-bold text-primary">{step === 1 ? t('createDonationModal.title') : t('createDonationModal.preview_header')}</h2>
                    <button onClick={onClose} className="text-text-dark hover:text-text-light transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                    {step === 1 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side: Item Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-text-light">{t('createDonationModal.items_title', { count: selectedItemIds.size })}</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('createDonationModal.search_placeholder')}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                                    />
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark" />
                                </div>
                                <div className="space-y-2 max-h-96 lg:max-h-[calc(85vh-350px)] overflow-y-auto pr-2 border border-border-color rounded-lg p-2 bg-dark-bg">
                                    {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                        <label key={item.id} className="flex items-center gap-3 p-3 bg-light-bg rounded-md cursor-pointer hover:bg-border-color transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedItemIds.has(item.id)}
                                                onChange={() => handleItemToggle(item.id)}
                                                className="w-5 h-5 rounded bg-dark-bg border-border-color text-primary focus:ring-primary flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-text-light capitalize">{item.name}</p>
                                                <p className="text-xs text-text-dark">{item.quantity} - Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</p>
                                            </div>
                                        </label>
                                    )) : <p className="text-center text-text-dark p-4">{t('createDonationModal.no_items_found')}</p>}
                                </div>
                            </div>

                            {/* Right Side: NGO & Delivery */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-text-light">{t('createDonationModal.ngo_title')}</h3>
                                <div className="bg-dark-bg p-3 rounded-lg border border-border-color">
                                    {isLoadingNgos ? (
                                        <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                    ) : errorNgos ? (
                                        <div className="h-96 flex items-center justify-center text-danger"><AlertTriangleIcon className="w-6 h-6 mr-2" /> {errorNgos}</div>
                                    ) : restaurantCoords ? (
                                        <NgoMap
                                            restaurantCoords={restaurantCoords}
                                            ngos={ngos}
                                            selectedNgo={selectedNgo}
                                            onNgoSelect={setSelectedNgo}
                                        />
                                    ) : (
                                        <div className="h-96 flex items-center justify-center text-text-dark">Could not load map. Location not available.</div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-dark mb-2">{t('createDonationModal.delivery_title')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setDeliveryType('pickup')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${deliveryType === 'pickup' ? 'bg-primary/20 border-primary' : 'bg-dark-bg border-border-color hover:border-primary/50'}`}>
                                            <TruckIcon className={`w-6 h-6 ${deliveryType === 'pickup' ? 'text-primary' : 'text-text-dark'}`} />
                                            <span className={`font-semibold text-sm ${deliveryType === 'pickup' ? 'text-primary' : 'text-text-light'}`}>{t('createDonationModal.ngo_pickup_label')}</span>
                                        </button>
                                        <button onClick={() => setDeliveryType('dropoff')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${deliveryType === 'dropoff' ? 'bg-primary/20 border-primary' : 'bg-dark-bg border-border-color hover:border-primary/50'}`}>
                                            <PackageIcon className={`w-6 h-6 ${deliveryType === 'dropoff' ? 'text-primary' : 'text-text-dark'}`} />
                                            <span className={`font-semibold text-sm ${deliveryType === 'dropoff' ? 'text-primary' : 'text-text-light'}`}>{t('createDonationModal.self_dropoff_label')}</span>
                                        </button>
                                    </div>
                                </div>
                                {deliveryType === 'pickup' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="pickupDate" className="block text-sm font-medium text-text-dark mb-1">{t('createDonationModal.pickup_date_label')}</label>
                                            <input type="date" id="pickupDate" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                        <div>
                                            <label htmlFor="pickupTime" className="block text-sm font-medium text-text-dark mb-1">{t('createDonationModal.pickup_time_label')}</label>
                                            <input type="time" id="pickupTime" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-text-dark mb-1">{t('createDonationModal.notes_title')}</label>
                                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t('createDonationModal.notes_placeholder')} className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                             <div>
                                <h4 className="font-semibold text-lg text-primary mb-2">{t('createDonationModal.items_header')} ({itemsToDonate.length})</h4>
                                <div className="bg-dark-bg p-3 rounded-lg max-h-40 overflow-y-auto border border-border-color space-y-2">
                                    {itemsToDonate.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-light-bg/50 rounded-md">
                                            <span className="text-text-light capitalize">{item.name}</span>
                                            <span className="text-text-dark">{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <h4 className="font-semibold text-lg text-primary mb-2">{t('createDonationModal.ngo_header')}</h4>
                                <div className="bg-dark-bg p-4 rounded-lg border border-border-color">
                                    <p className="font-bold text-text-light">{selectedNgo?.name}</p>
                                    <p className="text-sm text-text-dark flex items-center gap-2 mt-1"><MapPinIcon className="w-4 h-4" /> {selectedNgo?.address}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-lg text-primary mb-2">{t('createDonationModal.delivery_header')}</h4>
                                    <div className="bg-dark-bg p-4 rounded-lg border border-border-color h-full">
                                        <p className="text-text-light"><strong>{t('createDonationModal.delivery_method')}:</strong> {deliveryType === 'pickup' ? t('createDonationModal.ngo_pickup_label') : t('createDonationModal.self_dropoff_label')}</p>
                                        {deliveryType === 'pickup' && (pickupDate || pickupTime) &&
                                            <p className="text-text-light mt-2"><strong>{t('createDonationModal.pickup_schedule')}:</strong> {pickupDate && new Date(pickupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} {pickupTime}</p>
                                        }
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-lg text-primary mb-2">{t('createDonationModal.notes_header')}</h4>
                                    <div className="bg-dark-bg p-4 rounded-lg border border-border-color h-full">
                                        <p className="text-text-dark italic">{notes || t('createDonationModal.no_notes')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-5 border-t border-border-color flex-shrink-0">
                    {step === 1 ? (
                        <>
                            <button type="button" onClick={onClose} className="bg-light-bg text-text-light font-bold py-2 px-6 rounded-lg hover:bg-border-color transition-colors">
                                {t('createDonationModal.button_cancel')}
                            </button>
                            <button type="button" onClick={handlePreview} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50" disabled={selectedItemIds.size === 0 || !selectedNgo}>
                                {t('createDonationModal.button_preview')}
                            </button>
                        </>
                    ) : (
                         <>
                            <button type="button" onClick={() => setStep(1)} className="bg-light-bg text-text-light font-bold py-2 px-6 rounded-lg hover:bg-border-color transition-colors">
                                {t('createDonationModal.button_back')}
                            </button>
                            <button type="button" onClick={handleSubmit} className="bg-success text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
                                {t('createDonationModal.button_confirm')}
                            </button>
                        </>
                    )}
                </div>
                <style>{`
                    @keyframes modal-enter {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-modal-enter { animation: modal-enter 0.2s ease-out forwards; }
                     @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};
export default CreateDonationModal;