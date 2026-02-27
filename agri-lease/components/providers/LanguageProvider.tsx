'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, dictionaries } from '@/lib/dictionaries';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        const savedLocale = localStorage.getItem('agri-lease-locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'hi' || savedLocale === 'kn')) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('agri-lease-locale', newLocale);
        document.documentElement.lang = newLocale;
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dictionaries[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path} for locale: ${locale}`);
                return path;
            }
            current = current[key];
        }

        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
