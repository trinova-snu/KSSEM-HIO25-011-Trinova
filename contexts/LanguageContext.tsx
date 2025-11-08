import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'es' | 'hi' | 'fr' | 'de' | 'ta';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const storedValue = window.localStorage.getItem('pantrix-language');
            if (storedValue) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.error('Error reading language from localStorage:', error);
        }
        return 'en';
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('pantrix-language', JSON.stringify(language));
        } catch (error) {
            console.error('Error saving language to localStorage:', error);
        }
    }, [language]);


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
            // Fix: Explicitly type the accumulator in reduce to prevent incorrect type inference by TypeScript.
            return Object.entries(options).reduce((acc: string, [optKey, optValue]) => {
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
