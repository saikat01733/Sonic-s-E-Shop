'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => translations.en[key] || (key as string),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is the default language as requested by the user
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('sonic_lang') as Locale;
    if (saved === 'en' || saved === 'bn') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('sonic_lang', newLocale);
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'bn' : 'en';
    setLocale(next);
  };

  const t = (key: keyof typeof translations.en): string => {
    const currentDict = translations[locale] || translations.en;
    return currentDict[key] || translations.en[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
