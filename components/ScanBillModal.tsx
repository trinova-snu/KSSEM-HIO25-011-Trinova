import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InventoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { CameraIcon, CheckCircleIcon, CloseIcon, RefreshCwIcon, TrashIcon, AlertTriangleIcon, UploadIcon } from './icons';
import { extractItemsFromBill } from '../services/geminiService';

const foodCategories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Drinks", "Other"];
type ScannedItem = Omit<InventoryItem, 'id'>;

interface ScanBillModalProps {
    onClose: () => void;
    onAddItems: (items: ScannedItem[]) => void;
}

type View = 'selection' | 'camera' | 'loading' | 'confirm' | 'error';

const ScanBillModal: React.FC<ScanBillModalProps> = ({ onClose, onAddItems }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<View>('selection');
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const setupCamera = useCallback(async () => {
        try {
            if (streamRef.current) cleanupCamera();
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            setError(null);
            return true;
        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('scanBillModal.camera_error'));
            setView('error');
            return false;
        }
    }, [t, cleanupCamera]);

    useEffect(() => {
        if (view === 'camera') {
            setupCamera();
        }
        return () => {
            cleanupCamera();
        };
    }, [view, setupCamera, cleanupCamera]);

    const processImage = async (base64Image: string) => {
        setView('loading');
        try {
            const items = await extractItemsFromBill(base64Image);
            if (items.length > 0) {
                setScannedItems(items);
                setView('confirm');
            } else {
                 setError(t('scanBillModal.no_items_found'));
                 setView('error');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setView('error');
        }
    };
    
    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        cleanupCamera();

        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        processImage(base64Image);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
            const base64Image = (loadEvent.target?.result as string)?.split(',')[1];
            if (!base64Image) {
                setError(t('scanBillModal.file_read_error'));
                setView('error');
                return;
            }
            processImage(base64Image);
        };
        reader.onerror = () => {
             setError(t('scanBillModal.file_read_error'));
             setView('error');
        }
        reader.readAsDataURL(file);
    };


    const handleScanAgain = () => {
        setScannedItems([]);
        setError(null);
        setView('selection');
    };
    
    const handleUpdateItem = (index: number, field: keyof ScannedItem, value: string) => {
        const newItems = [...scannedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setScannedItems(newItems);
    };

    const handleDeleteItem = (index: number) => {
        setScannedItems(items => items.filter((_, i) => i !== index));
    };

    const handleConfirmAndAdd = () => {
        onAddItems(scannedItems);
        onClose();
    };

    const renderSelectionView = () => (
        <div className="text-center p-4">
            <h3 className="text-lg font-semibold text-text-light mb-6">{t('scanBillModal.selection_view_title')}</h3>
            <div className="space-y-4">
                <button 
                    onClick={() => setView('camera')}
                    className="w-full flex items-center justify-center gap-3 bg-secondary text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-500 transition-colors text-lg"
                >
                    <CameraIcon className="w-6 h-6" />
                    {t('scanBillModal.use_camera_button')}
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 bg-light-bg text-text-light font-bold py-4 px-4 rounded-lg hover:bg-border-color transition-colors text-lg"
                >
                    <UploadIcon className="w-6 h-6" /> 
                    {t('scanBillModal.upload_image_button')}
                </button>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
            />
        </div>
    );

    const renderCameraView = () => (
        <div>
            <h3 className="text-center text-lg font-semibold text-text-light mb-4">{t('scanBillModal.camera_view_title')}</h3>
            <div className="relative bg-dark-bg rounded-lg overflow-hidden aspect-[9/16] max-h-[60vh]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            </div>
            <button onClick={handleCapture} className="w-full mt-4 flex items-center justify-center gap-3 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                <CameraIcon />
                {t('scanBillModal.capture_button')}
            </button>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );

    const renderLoadingView = () => (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-text-light font-semibold">{t('scanBillModal.loading_text')}</p>
        </div>
    );

    const renderErrorView = () => (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangleIcon className="w-12 h-12 text-danger mb-4" />
            <p className="text-text-light font-semibold mb-2">Oops!</p>
            <p className="text-text-dark mb-6">{error}</p>
            <button onClick={handleScanAgain} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors">
                <RefreshCwIcon />
                {t('scanBillModal.scan_again_button')}
            </button>
        </div>
    );

    const renderConfirmView = () => (
        <div>
            <div className="text-center mb-4">
                 <h3 className="text-lg font-semibold text-text-light">{t('scanBillModal.confirm_view_title')}</h3>
                 <p className="text-sm text-text-dark">{t('scanBillModal.confirm_view_desc')}</p>
            </div>

            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                {scannedItems.map((item, index) => (
                    <div key={index} className="bg-dark-bg p-4 rounded-lg border border-border-color space-y-3">
                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                value={item.name}
                                onChange={e => handleUpdateItem(index, 'name', e.target.value)}
                                className="w-full bg-light-bg border border-border-color rounded-md px-3 py-2 text-text-light font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                aria-label="Item name"
                            />
                            <button onClick={() => handleDeleteItem(index)} className="ml-3 bg-danger/20 text-danger p-2.5 rounded-md hover:bg-danger/40 transition-colors flex-shrink-0" aria-label="Delete item">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-text-dark px-1">{t('addItem.quantity_label')}</label>
                                <input
                                    type="text"
                                    value={item.quantity}
                                    onChange={e => handleUpdateItem(index, 'quantity', e.target.value)}
                                    className="w-full bg-light-bg border border-border-color rounded-md px-3 py-2 text-text-light text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    aria-label="Item quantity"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-dark px-1">{t('addItem.category_label')}</label>
                                <select
                                    value={item.category}
                                    onChange={e => handleUpdateItem(index, 'category', e.target.value)}
                                    className="w-full bg-light-bg border border-border-color rounded-md px-3 py-2 text-text-light text-sm focus:outline-none focus:ring-1 focus:ring-primary h-[42px]"
                                    aria-label="Item category"
                                >
                                    {foodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-text-dark px-1">{t('addItem.expiry_date_label')}</label>
                            <input
                                type="date"
                                value={item.expiryDate}
                                onChange={e => handleUpdateItem(index, 'expiryDate', e.target.value)}
                                className="w-full bg-light-bg border border-border-color rounded-md px-3 py-2 text-text-light text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                aria-label="Item expiry date"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={handleScanAgain} className="flex-1 flex items-center justify-center gap-2 bg-light-bg text-text-light font-bold py-3 px-4 rounded-lg hover:bg-border-color transition-colors">
                    <RefreshCwIcon />
                    {t('scanBillModal.scan_again_button')}
                </button>
                <button onClick={handleConfirmAndAdd} className="flex-1 flex items-center justify-center gap-2 bg-success text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors" disabled={scannedItems.length === 0}>
                    <CheckCircleIcon />
                    {t('scanBillModal.add_to_pantry_button', { count: scannedItems.length })}
                </button>
            </div>
        </div>
    );
    
    const renderView = () => {
        switch (view) {
            case 'selection': return renderSelectionView();
            case 'camera': return renderCameraView();
            case 'loading': return renderLoadingView();
            case 'confirm': return renderConfirmView();
            case 'error': return renderErrorView();
            default: return null;
        }
    };
    
    return (
        <div className="bg-light-bg w-full max-w-lg rounded-2xl shadow-2xl border border-border-color transform transition-all duration-300">
            <div className="flex justify-between items-center p-5 border-b border-border-color">
                <h2 className="text-xl font-bold text-primary">{t('scanBillModal.title')}</h2>
                <button onClick={onClose} className="text-text-dark hover:text-text-light transition-colors">
                    <CloseIcon />
                </button>
            </div>
            <div className="p-5">
                {renderView()}
            </div>
        </div>
    );
};

export default ScanBillModal;