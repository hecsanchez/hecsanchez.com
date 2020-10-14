import { useContext } from 'react';

import { LanguageContext } from './LanguageProvider';

export default function useLocale() {
  const [locale] = useContext(LanguageContext);
  return { locale };
}
