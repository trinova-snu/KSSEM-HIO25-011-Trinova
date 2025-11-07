import React, { useMemo, useRef, useState, useEffect } from 'react';
import { NgoWithCoords, GeoLocation } from '../services/geminiService';
import { MapPinIcon, StoreIcon } from './icons';

interface NgoMapProps {
    restaurantCoords: GeoLocation;
    ngos: NgoWithCoords[];
    selectedNgo: NgoWithCoords | null;
    onNgoSelect: (ngo: NgoWithCoords) => void;
}

const PADDING = 20;

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    if (inMax - inMin === 0) return (outMin + outMax) / 2;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const MapPin: React.FC<{ type: 'restaurant' | 'ngo' | 'selected'; name: string; }> = ({ type, name }) => {
    const baseClasses = "absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200";
    const typeClasses = {
        restaurant: 'text-secondary z-10',
        ngo: 'text-text-dark hover:text-primary',
        selected: 'text-primary z-20 scale-125',
    };
    const icon = type === 'restaurant' ? <StoreIcon className="w-7 h-7" /> : <MapPinIcon className="w-7 h-7" />;

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} title={name}>
            {icon}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-dark-bg/80 text-white text-xs px-2 py-1 rounded-md ${type === 'selected' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {name}
            </div>
        </div>
    );
};

const NgoMap: React.FC<NgoMapProps> = ({ restaurantCoords, ngos, selectedNgo, onNgoSelect }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const mapElement = mapRef.current;
        if (!mapElement) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(mapElement);
        return () => resizeObserver.unobserve(mapElement);
    }, []);

    const projectedPoints = useMemo(() => {
        const { width, height } = dimensions;
        if (!restaurantCoords || width === 0 || height === 0) return [];
        
        const allPoints = [
            {...restaurantCoords, name: 'Your Location', type: 'restaurant', address: ''},
            ...ngos.map(n => ({...n, type: 'ngo'}))
        ];
        
        let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        allPoints.forEach(p => {
            minLat = Math.min(minLat, p.latitude);
            maxLat = Math.max(maxLat, p.latitude);
            minLng = Math.min(minLng, p.longitude);
            maxLng = Math.max(maxLng, p.longitude);
        });

        const latPad = (maxLat - minLat) * 0.2 || 0.2;
        const lngPad = (maxLng - minLng) * 0.2 || 0.2;
        minLat -= latPad;
        maxLat += latPad;
        minLng -= lngPad;
        maxLng += lngPad;

        return allPoints.map(p => ({
            ...p,
            x: mapRange(p.longitude, minLng, maxLng, PADDING, width - PADDING),
            y: mapRange(p.latitude, maxLat, minLat, PADDING, height - PADDING),
        }));
    }, [restaurantCoords, ngos, dimensions]);

    return (
        <div className="h-full flex flex-col min-h-0">
            <div ref={mapRef} className="relative w-full h-80 bg-dark-bg/50 border-2 border-border-color rounded-lg overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                 <style>{`.bg-grid-pattern { background-image: linear-gradient(to right, #4a5568 1px, transparent 1px), linear-gradient(to bottom, #4a5568 1px, transparent 1px); background-size: 20px 20px; }`}</style>
                {projectedPoints.map(point => (
                    <div 
                        key={point.name} 
                        style={{ left: `${point.x}px`, top: `${point.y}px` }}
                        className="group"
                        onClick={() => point.type === 'ngo' && onNgoSelect(point as NgoWithCoords)}
                    >
                        <MapPin
                            name={point.name}
                            type={point.type === 'restaurant' ? 'restaurant' : (selectedNgo?.name === point.name ? 'selected' : 'ngo')}
                        />
                    </div>
                ))}
            </div>
            <div className="flex-1 w-full overflow-y-auto space-y-2 pr-1 mt-4 min-h-0">
                {ngos.map(ngo => (
                    <button 
                        key={ngo.name} 
                        onClick={() => onNgoSelect(ngo)}
                        className={`w-full text-left p-3 rounded-md border-2 transition-colors ${selectedNgo?.name === ngo.name ? 'bg-primary/20 border-primary' : 'bg-dark-bg/50 border-border-color hover:border-primary/50'}`}
                    >
                        <p className="font-semibold text-text-light">{ngo.name}</p>
                        <p className="text-xs text-text-dark">{ngo.address}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NgoMap;