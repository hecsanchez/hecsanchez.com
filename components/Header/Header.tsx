import React from 'react';
import Link from 'next/link';
import logo from '@assets/img/hecsanchez-logo.png';
import { Container, Logo, Nav } from './Header.styled';
import useTranslation from '@intl/useTranslations';
import useLocale from '@intl/useLocale';

const Header = (): JSX.Element => {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <Container>
      <Link href={`/${locale}`}>
        <Logo src={logo} />
      </Link>
      <Nav>
        <Link href={`/${locale}/blog`}>
          <a>{t('blog')}</a>
        </Link>
        <Link href={`/${locale}/about`}>
          <a>{t('about')}</a>
        </Link>
        <Link href={`/${locale}/contact`}>
          <a>{t('contact')}</a>
        </Link>
      </Nav>
    </Container>
  );
};

export default Header;
