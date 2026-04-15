// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://hecsanchez.com';

/**
 * Scan src/content/blog/*.{md,mdx} once at config time and return the absolute
 * URLs of any post with `draft: true`. Used to keep draft posts out of the
 * generated sitemap. The static page is still built (so the URL works as a
 * preview link), but it's not advertised anywhere.
 */
function getDraftUrls() {
  const dir = path.resolve('./src/content/blog');
  if (!fs.existsSync(dir)) return new Set();
  const drafts = new Set();
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    if (!/^draft:\s*true\s*$/m.test(fm[1])) continue;
    const localeMatch = fm[1].match(/^locale:\s*['"]?(\w+)['"]?\s*$/m);
    const locale = localeMatch?.[1];
    const slug = file.replace(/\.mdx?$/, '');
    if (locale === 'en') drafts.add(`${SITE}/en/writing/${slug}/`);
    else if (locale === 'es') drafts.add(`${SITE}/es/escritos/${slug}/`);
  }
  return drafts;
}

const draftUrls = getDraftUrls();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-MX', en: 'en-US' },
      },
      filter: (page) => !draftUrls.has(page),
    }),
    icon({ include: { hugeicons: ['*'] } }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
