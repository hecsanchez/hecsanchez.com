/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
        locales: ['default', 'en', 'es'],
        defaultLocale: 'default',
        localeDetection: false,
    },
    trailingSlash: true,
    useStrictMode: false,
}

module.exports = nextConfig;
