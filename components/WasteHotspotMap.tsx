import React, { useMemo, useRef, useState, useEffect } from 'react';
import { WasteHotspot } from '../types';
import { GeoLocation } from '../services/geminiService';
import { StoreIcon } from './icons';

interface WasteHotspotMapProps {
    centerCoords: GeoLocation;
    hotspots: WasteHotspot[];
    onSelectHotspot: (hotspot: WasteHotspot) => void;
    highlightedHotspotId: string | null;
    onHoverHotspot: (id: string | null) => void;
}

const PADDING = 20;

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    if (inMax - inMin === 0) return (outMin + outMax) / 2;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const HotspotCircle: React.FC<{ name: string; score: number; isHighlighted: boolean }> = ({ name, score, isHighlighted }) => {
    const opacity = 0.4 + (score / 10) * 0.6; // Opacity from 0.4 to 1.0
    const baseSize = 16 + (score / 10) * 16; // Size from 16px to 32px
    const size = isHighlighted ? baseSize * 1.5 : baseSize;

    return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            title={name}
        >
            <div 
                className="rounded-full bg-danger transition-all duration-300"
                style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                    opacity: opacity, 
                    boxShadow: isHighlighted ? '0 0 15px 3px rgba(255, 255, 255, 0.7)' : '0 0 10px rgba(245, 101, 101, 0.5)',
                    border: isHighlighted ? '2px solid white' : 'none',
                }}
            ></div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-dark-bg/80 text-white text-xs px-2 py-1 rounded-md transition-opacity duration-200 pointer-events-none ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {name} (Score: {score})
            </div>
        </div>
    );
};


const WasteHotspotMap: React.FC<WasteHotspotMapProps> = ({ centerCoords, hotspots, onSelectHotspot, highlightedHotspotId, onHoverHotspot }) => {
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
        if (!centerCoords || width === 0 || height === 0) return [];
        
        const allPoints = [
            {...centerCoords, name: 'Your Location', type: 'center', id: 'center-location'},
            ...hotspots.map(h => ({...h, type: 'hotspot'}))
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
    }, [centerCoords, hotspots, dimensions]);
    
    return (
        <div ref={mapRef} className="relative w-full h-full bg-dark-bg/50 border-2 border-border-color rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
            <style>{`.bg-grid-pattern { background-image: linear-gradient(to right, #4a5568 1px, transparent 1px), linear-gradient(to bottom, #4a5568 1px, transparent 1px); background-size: 20px 20px; }`}</style>
            {projectedPoints.map((point) => {
                if (point.type === 'center') {
                    return (
                        <div key="center" style={{ left: `${point.x}px`, top: `${point.y}px` }} className="absolute transform -translate-x-1/2 -translate-y-1/2 text-secondary z-10" title="Your Location">
                            <StoreIcon className="w-8 h-8"/>
                        </div>
                    );
                }
                if (point.type === 'hotspot') {
                     return (
                        <div 
                            key={point.id} 
                            style={{ left: `${point.x}px`, top: `${point.y}px` }}
                            onClick={() => onSelectHotspot(point as WasteHotspot)}
                            onMouseEnter={() => onHoverHotspot(point.id)}
                            onMouseLeave={() => onHoverHotspot(null)}
                        >
                            <HotspotCircle 
                                name={point.name} 
                                score={(point as WasteHotspot).wasteScore}
                                isHighlighted={highlightedHotspotId === point.id}
                            />
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default WasteHotspotMap;