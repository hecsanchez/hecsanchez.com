import React from 'react'
import Head from 'next/head'
import { getInitialLocale } from '@intl/getInitialLocale'
import { useRouter } from 'next/dist/client/router'

const Index: React.FC = () => {
    const router = useRouter()
    React.useEffect(() => {
      router.replace('/[lang]', `/${getInitialLocale()}`)
    })
    return (
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
    )
  }
  
  export default Index