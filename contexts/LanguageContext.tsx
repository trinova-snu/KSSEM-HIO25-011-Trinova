import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'es' | 'hi' | 'fr' | 'de' | 'ta';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
        const keys = key.split('.');
        let result = translations[language];

        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = (result as any)[k];
            } else {
                return key; // Return the key if translation is not found
            }
        }
        
        if (typeof result === 'string' && options) {
            return Object.entries(options).reduce((acc, [optKey, optValue]) => {
                return acc.replace(`{${optKey}}`, String(optValue));
            }, result);
        }

        return typeof result === 'string' ? result : key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};