import React, { useState } from 'react';
import { ArrowLeftIcon, UserIcon, GoogleIcon, EyeIcon, EyeOffIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import LocationSelector from './LocationSelector';

interface PublicLoginPageProps {
    onLogin: (name: string, email: string, location: string) => void;
    onBack: () => void;
    onGoToSignUp: () => void;
}

const PublicLoginPage: React.FC<PublicLoginPageProps> = ({ onLogin, onBack, onGoToSignUp }) => {
    const { t } = useLanguage();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = email.split('@')[0]; // Simple name from email for demo
        onLogin(name, email, location);
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
                    <h1 className="text-3xl font-bold text-text-light">{t('login.public_title')}</h1>
                    <p className="text-text-dark mt-1">{t('login.public_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-light-bg/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-border-color/50">
                    <button type="button" className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        <GoogleIcon className="w-5 h-5" />
                        Login with Google
                    </button>
                    <div className="flex items-center">
                        <div className="flex-grow border-t border-border-color"></div>
                        <span className="flex-shrink mx-4 text-text-dark text-sm">{t('signup.or_divider')}</span>
                        <div className="flex-grow border-t border-border-color"></div>
                    </div>
                    
                    <div className="space-y-4">
                        <input 
                            type="email" 
                            placeholder={t('login.email_label')} 
                            className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required 
                        />
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder={t('login.password_label')} 
                                className="w-full bg-dark-bg border border-border-color rounded-lg px-4 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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
                         <div>
                            <label className="block text-sm font-medium text-text-dark mb-1">{t('login.location_label')}</label>
                            <LocationSelector onLocationChange={setLocation} />
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                            {t('login.login_button')}
                        </button>
                    </div>
                    <p className="text-center text-sm text-text-dark pt-2">{t('login.signup_prompt')} <a href="#" onClick={(e) => { e.preventDefault(); onGoToSignUp(); }} className="font-semibold text-primary hover:underline">{t('login.signup_link')}</a></p>
                </form>
            </div>
        </div>
    );
};

export default PublicLoginPage;