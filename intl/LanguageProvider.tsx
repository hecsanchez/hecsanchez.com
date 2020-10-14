import { createContext, useState, useEffect } from 'react';

export const defaultLocale = 'en';
export const locales = ['es', 'en'];
export const LanguageContext = createContext([]);

export const LanguageProvider: React.FC = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const pathLang = window.location.pathname.split('/')[1];
    if (pathLang && locales.includes(pathLang) && locale !== pathLang) {
      setLocale(pathLang);
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={[locale, setLocale]}>
      {children}
    </LanguageContext.Provider>
  );
};
