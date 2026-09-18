import React, { createContext, useContext } from 'react';
import { useSettings } from './SettingsContext';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { state, dispatch } = useSettings();
  const currentLang = state.language || 'en';

  const t = (key, defaultText) => {
    const langDict = translations[currentLang] || translations.en;
    return langDict[key] || translations.en[key] || defaultText || key;
  };

  const setLanguage = (langCode) => {
    dispatch({ type: 'SET_LANGUAGE', payload: langCode });
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if accessed outside provider
    return {
      t: (key, defaultText) => translations.en[key] || defaultText || key,
      currentLang: 'en',
      setLanguage: () => {}
    };
  }
  return context;
}
