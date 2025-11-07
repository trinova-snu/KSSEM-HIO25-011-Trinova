import React, { useState } from 'react';
import { ArrowLeftIcon, HandHeartIcon, EyeIcon, EyeOffIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { FoodBankProfile } from '../types';
import LocationSelector from './LocationSelector';

interface FoodBankSignUpProps {
    onSignUp: (profile: FoodBankProfile) => void;
    onBack: () => void;
    onGoToLogin: () => void;
}

const FoodBankSignUp: React.FC<FoodBankSignUpProps> = ({ onSignUp, onBack, onGoToLogin }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [contactPerson, setContactPerson] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [website, setWebsite] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location || !email) {
            alert("Please fill in all required fields.");
            return;
        }
        onSignUp({ name, location, email, contactPerson, phoneNumber, website });
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
                        <HandHeartIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-light">Food Bank & NGO Sign Up</h1>
                    <p className="text-text-dark mt-1">Register to connect with donors and manage contributions.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 bg-light-bg/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-border-color/50">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">{t('login.org_name_label')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('login.org_name_placeholder')}
                            className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">{t('login.location_label')}</label>
                         <LocationSelector onLocationChange={setLocation} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">{t('login.org_email_label')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                onChange={(e) => setPassword(e.target.value)}
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
                    <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-text-dark mb-1">Contact Person (Optional)</label>
                        <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="e.g., Jane Doe" className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-dark mb-1">Phone Number (Optional)</label>
                        <input type="tel" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="(123) 456-7890" className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-text-dark mb-1">Website (Optional)</label>
                        <input type="url" id="website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full bg-dark-bg border border-border-color rounded-lg px-3 py-2 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                            {t('signup.create_account_button')}
                        </button>
                    </div>
                    <p className="text-center text-sm text-text-dark pt-2">{t('signup.login_prompt')} <a href="#" onClick={(e) => { e.preventDefault(); onGoToLogin(); }} className="font-semibold text-primary hover:underline">{t('signup.login_link')}</a></p>
                </form>
            </div>
        </div>
    );
};

export default FoodBankSignUp;