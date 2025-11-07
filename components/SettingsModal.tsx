import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { language, setLanguage, t } = useLanguage();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'ta', name: 'தமிழ்' },
    ] as const;

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-dark mb-2">{t('settings.language_label')}</label>
                <div className="flex flex-col space-y-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                language === lang.code
                                    ? 'bg-primary text-white font-bold'
                                    : 'bg-dark-bg text-text-light hover:bg-border-color'
                            }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;