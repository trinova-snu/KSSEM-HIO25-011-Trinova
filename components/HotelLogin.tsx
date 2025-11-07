import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, BuildingIcon, EyeIcon, EyeOffIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getBusinessNames } from '../services/geminiService';
import LocationSelector from './LocationSelector';

interface HotelLoginProps {
    onLogin: (name: string, location: string, email: string) => void;
    onBack: () => void;
    onGoToSignUp: () => void;
}

const HotelLogin: React.FC<HotelLoginProps> = ({ onLogin, onBack, onGoToSignUp }) => {
    const { t } = useLanguage();
    const [location, setLocation] = useState('');
    const [isLoadingNames, setIsLoadingNames] = useState(false);
    const [names, setNames] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('manager@example.com');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [locationSelected, setLocationSelected] = useState(false);

    const handleLocationChange = (newLocation: string) => {
        setLocation(newLocation);
        const [city, state, country] = newLocation.split(', ');
        setLocationSelected(!!city && !!state && !!country);
    };

    useEffect(() => {
        const fetchNames = async () => {
            if (!locationSelected) {
                setNames([]);
                setName('');
                return;
            };
            setIsLoadingNames(true);
            setName('');
            try {
                const fetchedNames = await getBusinessNames(location, 'restaurant');
                setNames(fetchedNames);
            } catch (e) {
                console.error(e);
                setNames([]);
            } finally {
                setIsLoadingNames(false);
            }
        };
        fetchNames();
    }, [location, locationSelected]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) {
            alert("Please select a restaurant.");
            return;
        }
        onLogin(name, location, email);
    };

    return (
        <div 
            className="min-h-screen flex flex-col justify-center items-center p-4 relative bg-dark-bg"
            style={{
                backgroundImage: 'radial-gradient(rgba(74, 85, 104, 0.5) 0.5px, transparent 0.5px)',
                backgroundSize: '2rem 2rem'
            }}
        >
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-text-dark hover:text-text-light transition-colors z-10">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>{t('login.back')}</span>
            </button>
            <div className="w-full max-w-sm z-10">
                 <div className="text-center mb-8">
                    <div className="bg-light-bg inline-block p-4 rounded-full mb-4 border-2 border-border-color">
                        <BuildingIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-light">{t('login.hotel_title')}</h1>
                    <p className="text-text-dark mt-1">{t('login.hotel_subtitle')}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 bg-light-bg/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-border-color/50">
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">{t('login.location_label')}</label>
                        <LocationSelector onLocationChange={handleLocationChange} />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">{t('login.restaurant_name_label')}</label>
                        {isLoadingNames ? (
                             <div className="h-[42px] bg-dark-bg border border-border-color rounded-lg flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                             </div>
                        ) : (
                            <select
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                disabled={!locationSelected || names.length === 0}
                            >
                                <option value="" disabled>{names.length === 0 && locationSelected ? 'No restaurants found' : 'Select a restaurant'}</option>
                                {names.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">{t('login.business_email_label')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">{t('login.password_label')}</label>
                         <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-text-dark hover:text-primary"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    <div className="pt-4">
                         <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors" disabled={!name}>
                            {t('login.login_button')}
                        </button>
                    </div>
                     <p className="text-center text-sm text-text-dark pt-2">{t('login.signup_prompt')} <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignUp(); }} className="font-semibold text-primary hover:underline">{t('login.signup_link')}</a></p>
                </form>
            </div>
        </div>
    );
};

export default HotelLogin;