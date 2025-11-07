import React, { useState } from 'react';
import { ArrowLeftIcon, UserIcon, GoogleIcon, EyeIcon, EyeOffIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import LocationSelector from './LocationSelector';

interface PublicSignUpProps {
    onSignUp: (profile: UserProfile) => void;
    onBack: () => void;
    onGoToLogin: () => void;
}

export const TASTE_PREFERENCES = ["Spicy", "Sweet", "Savory", "Vegetarian", "Vegan", "Gluten-Free", "Low-Carb", "Dairy-Free"];

const PublicSignUp: React.FC<PublicSignUpProps> = ({ onSignUp, onBack, onGoToLogin }) => {
    const { t } = useLanguage();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [height, setHeight] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
    const [preferences, setPreferences] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const handlePreferenceToggle = (pref: string) => {
        setPreferences(prev => 
            prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const profile: UserProfile = {
            name,
            email,
            country: location, // The location string from selector will be used as country for now.
            weight: parseFloat(weight) || 0,
            weightUnit,
            height: parseFloat(height) || 0,
            heightUnit,
            preferences
        };
        onSignUp(profile);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative bg-dark-bg overflow-hidden">
            <div className="aurora-bg"></div>
            <style>{`
                /* Aurora background animation */
                @keyframes aurora-animation { 0% { transform: translate(-50%, -50%) rotate(0deg) scale(1.5); } 50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.8); } 100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.5); } }
                .aurora-bg { position: absolute; top: 50%; left: 50%; width: 150vw; height: 150vh; background: radial-gradient(circle, rgba(237, 137, 54, 0.2) 0%, rgba(237, 137, 54, 0) 40%), radial-gradient(circle, rgba(66, 153, 225, 0.2) 20%, rgba(66, 153, 225, 0) 60%); animation: aurora-animation 25s linear infinite; z-index: 0; }
                /* Form entrance animation */
                @keyframes form-fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-form-enter { animation: form-fade-in-up 0.6s ease-out forwards; }
            `}</style>
            
            <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-text-dark hover:text-text-light transition-colors z-10">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>{t('login.back')}</span>
            </button>

            <div className="w-full max-w-md z-10 animate-form-enter">
                <div className="text-center mb-8">
                    <div className="bg-light-bg inline-block p-4 rounded-full mb-4 border-2 border-border-color">
                        <UserIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-light">{t('signup.title')}</h1>
                    <p className="text-text-dark mt-1">{t('signup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-light-bg/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-border-color/50">
                    <button type="button" className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        <GoogleIcon className="w-5 h-5" />
                        {t('signup.google_button')}
                    </button>
                    <div className="flex items-center">
                        <div className="flex-grow border-t border-border-color"></div>
                        <span className="flex-shrink mx-4 text-text-dark text-sm">{t('signup.or_divider')}</span>
                        <div className="flex-grow border-t border-border-color"></div>
                    </div>
                    
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <input type="email" placeholder={t('login.email_label')} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" required />
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('login.password_label')} 
                                className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-text-dark hover:text-primary"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                         <LocationSelector onLocationChange={setLocation} />
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-text-dark mb-1 ml-1">{t('signup.weight_label')}</label>
                               <div className="flex items-center bg-dark-bg border border-border-color rounded-lg focus-within:ring-2 focus-within:ring-primary">
                                   <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-transparent px-3 py-2 text-text-light outline-none"/>
                                   <button type="button" onClick={() => setWeightUnit('kg')} className={`px-3 py-1 text-sm rounded-md ${weightUnit === 'kg' ? 'bg-primary text-white' : 'text-text-dark'}`}>kg</button>
                                   <button type="button" onClick={() => setWeightUnit('lbs')} className={`px-3 py-1 text-sm rounded-md mr-1 ${weightUnit === 'lbs' ? 'bg-primary text-white' : 'text-text-dark'}`}>lbs</button>
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-text-dark mb-1 ml-1">{t('signup.height_label')}</label>
                               <div className="flex items-center bg-dark-bg border border-border-color rounded-lg focus-within:ring-2 focus-within:ring-primary">
                                   <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-transparent px-3 py-2 text-text-light outline-none"/>
                                   <button type="button" onClick={() => setHeightUnit('cm')} className={`px-3 py-1 text-sm rounded-md ${heightUnit === 'cm' ? 'bg-primary text-white' : 'text-text-dark'}`}>cm</button>
                                   <button type="button" onClick={() => setHeightUnit('in')} className={`px-3 py-1 text-sm rounded-md mr-1 ${heightUnit === 'in' ? 'bg-primary text-white' : 'text-text-dark'}`}>in</button>
                               </div>
                           </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2 ml-1">{t('signup.preferences_label')}</label>
                            <div className="flex flex-wrap gap-2">
                                {TASTE_PREFERENCES.map(pref => (
                                    <button
                                        type="button"
                                        key={pref}
                                        onClick={() => handlePreferenceToggle(pref)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${preferences.includes(pref) ? 'bg-primary border-primary text-white' : 'bg-dark-bg border-border-color text-text-dark hover:border-primary'}`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>
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

export default PublicSignUp;