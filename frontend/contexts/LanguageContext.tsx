'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Language, loadTranslation, getTranslation, saveLanguagePreference, getDefaultLanguage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translation: Record<string, any>;
  isLoading: boolean;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [translation, setTranslation] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language on mount
  useEffect(() => {
    const defaultLang = getDefaultLanguage();
    setLanguageState(defaultLang);
    loadTranslationData(defaultLang);
  }, []);

  const loadTranslationData = async (lang: Language) => {
    setIsLoading(true);
    const trans = await loadTranslation(lang);
    setTranslation(trans);
    setIsLoading(false);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
    loadTranslationData(lang);

    // Update HTML dir attribute for RTL languages
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return getTranslation(translation, key);
  };

  const isRTL = language === 'ar';

  // Update document when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translation,
    isLoading,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
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
