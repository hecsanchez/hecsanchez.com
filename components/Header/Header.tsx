import React from 'react'
import Link from 'next/link'
import logo from '@assets/img/hecsanchez-logo.png';
import {Container, Logo, Nav } from './Header.styled';
import useTranslation from "@intl/useTranslations";

const Header = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Container>
            <Logo src={logo}/>
            <Nav>
                <Link href="/courses">
                    <a>{t("courses")}</a>
                </Link>
                <Link href="/podcasts">
                    <a>{t("podcasts")}</a>
                </Link>
                <Link href="/blog">
                    <a>{t("blog")}</a>
                </Link>
                <Link href="/about">
                    <a>{t("about")}</a>
                </Link>
                <Link href="/contact">
                    <a>{t("contact")}</a>
                </Link>
            </Nav>
        </Container>
    )
}

export default Header;