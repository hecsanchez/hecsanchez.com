import React from 'react'
import Head from 'next/head'
import useTranslation from "@intl/useTranslations";
import Layout from "@components/Layout";

const Index: React.FC = () => {
  const { t } = useTranslation(); 

  return (
        <Layout className="posts" title={t("homeMetaTitle")}>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div>
          <h1>{t('homeTitle')}</h1>
        </div>
        </Layout>
    )
  }
  
  export default Index