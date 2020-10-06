import { defaultLocale, locales } from './LanguageProvider'

function isLocale(tested: string): boolean {
  return locales.some(locale => locale === tested)
}

export function getInitialLocale(): string {
  const localSetting = localStorage.getItem('locale')
  console.log(localSetting)
  if (localSetting && isLocale(localSetting)) {
    return localSetting
  }

  // the language setting of the browser
  const [browserSetting] = navigator.language.split('-')
  if (isLocale(browserSetting)) {
    return browserSetting
  }

  return defaultLocale
}