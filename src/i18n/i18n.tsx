import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ptBR from './translations/pt-BR.json';
import en from './translations/en.json';
import es from './translations/es.json';

type Locale = 'pt-BR' | 'en' | 'es';
type Dictionary = typeof ptBR;

const dictionaries: Record<Locale, Dictionary> = {
    'pt-BR': ptBR,
    en,
    es
};

const getNested = (obj: any, path: string) => {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const replaceParams = (text: string, params?: Record<string, string | number>) => {
    if (!params) return text;
    return Object.keys(params).reduce((acc, key) => acc.replaceAll(`{${key}}`, String(params[key])), text);
};

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initial = (localStorage.getItem('locale') as Locale) || 'pt-BR';
    const [locale, setLocaleState] = useState<Locale>(initial);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        localStorage.setItem('locale', next);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        const dict = dictionaries[locale] || dictionaries['pt-BR'];
        const value = getNested(dict, key) ?? getNested(dictionaries['pt-BR'], key) ?? key;
        return replaceParams(String(value), params);
    }, [locale]);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
};
