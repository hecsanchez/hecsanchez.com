// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hecsanchez.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-MX', en: 'en-US' },
      },
    }),
    icon({ include: { hugeicons: ['*'] } }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
