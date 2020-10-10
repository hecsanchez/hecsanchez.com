import { useEffect } from 'react';
import { AppPropsType } from "next/dist/next-server/lib/utils"
import { LanguageProvider, locales } from "@intl/LanguageProvider"
import { getInitialLocale } from '@intl/getInitialLocale'

export default function App({ Component, pageProps, router }: AppPropsType) {
    useEffect(() => {
      const pathLang = window.location.pathname.split('/')[1];
      if (!locales.includes(pathLang)) {
        router.replace(`/${getInitialLocale()}${window.location.pathname}`)
      }
    })

  return (
    <LanguageProvider>
      <Component {...pageProps} key={router.route} />
    </LanguageProvider>
  )
}
