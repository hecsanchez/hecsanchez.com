import React from 'react';
import useTranslation from '@intl/useTranslations';
import Layout from '@components/Layout';
import useLang from '@intl/useLocale';

const Index: React.FC = () => {
  const { t } = useTranslation();
  const { locale } = useLang();

  return (
    <Layout className="posts" title={t('homeMetaTitle')}>
      <div>
        <h1>{t('aboutTitle')}</h1>
        <p></p>
      </div>
    </Layout>
  );
};

export default Index;
