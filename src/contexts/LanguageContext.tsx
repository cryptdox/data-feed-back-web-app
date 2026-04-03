import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { STORAGE_KEYS } from '../constants';

type WidenStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends object ? WidenStrings<T[K]> : T[K]
};

type Translation = WidenStrings<typeof translations.en>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (stored as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
