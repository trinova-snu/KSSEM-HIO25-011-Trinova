import React, { useState, useEffect } from 'react';
import { locations, countries } from '../utils/locations';

interface LocationSelectorProps {
    onLocationChange: (location: string) => void;
    initialLocation?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, initialLocation }) => {
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    
    useEffect(() => {
        if (initialLocation) {
            const [city, state, country] = initialLocation.split(', ').map(s => s.trim());
            if (country && countries.includes(country)) {
                setSelectedCountry(country);
                const countryStates = Object.keys(locations[country] || {}).sort();
                setStates(countryStates);
                if (state && countryStates.includes(state)) {
                    setSelectedState(state);
                    const stateCities = (locations[country]?.[state] || []).sort();
                    setCities(stateCities);
                    if (city && stateCities.includes(city)) {
                        setSelectedCity(city);
                    }
                }
            }
        }
    }, [initialLocation]);

    useEffect(() => {
        if (selectedCountry) {
            const countryStates = Object.keys(locations[selectedCountry] || {}).sort();
            setStates(countryStates);
            setSelectedState('');
            setCities([]);
            setSelectedCity('');
        } else {
            setStates([]);
            setSelectedState('');
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedState) {
            const stateCities = (locations[selectedCountry]?.[selectedState] || []).sort();
            setCities(stateCities);
            setSelectedCity('');
        } else {
            setCities([]);
            setSelectedCity('');
        }
    }, [selectedState, selectedCountry]);

    useEffect(() => {
        if (selectedCity && selectedState && selectedCountry) {
            onLocationChange(`${selectedCity}, ${selectedState}, ${selectedCountry}`);
        } else {
            onLocationChange('');
        }
    }, [selectedCity, selectedState, selectedCountry, onLocationChange]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Country Dropdown */}
            <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="">Select Country</option>
                {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
            </select>

            {/* State Dropdown */}
            <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={!selectedCountry || states.length === 0}
                className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
                <option value="">Select State</option>
                {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                ))}
            </select>

            {/* City Dropdown */}
            <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState || cities.length === 0}
                className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
                <option value="">Select City</option>
                {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
        </div>
    );
};

export default LocationSelector;