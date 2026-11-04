import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { aiConfig } from '../src/features/ai/config.ts';

test('production preserves existing professional pages, feeds and newsletter form', () => {
  for (const route of ['es', 'en', 'es/contacto', 'en/contact', 'es/como-trabajo', 'en/how-i-work', 'es/proyectos/the-woods-crm', 'en/projects/the-woods-crm', 'es/escritos', 'en/writing']) {
    assert.ok(existsSync(`dist/${route}/index.html`), route);
  }
  for (const locale of ['es', 'en']) {
    const home = readFileSync(`dist/${locale}/index.html`, 'utf8');
    assert.ok(home.includes('subscribe-block-form'));
    assert.ok(existsSync(`dist/${locale}/${locale === 'es' ? 'escritos' : 'writing'}/rss.xml`));
  }
});

test('only published AI routes and entries can exist in a production build', () => {
  const published = aiConfig.journey === 'published';
  assert.equal(existsSync('dist/es/ia/index.html'), published);
  assert.equal(existsSync('dist/es/ia/gracias/index.html'), published);
  assert.equal(existsSync('dist/es/ia/kit/index.html'), false);
  assert.equal(existsSync('dist/es/ia/taller/index.html'), false);
  assert.equal(existsSync('dist/en/ia/index.html'), false);
  const home = readFileSync('dist/es/index.html', 'utf8');
  assert.equal(home.includes('Explorar IA para negocios'), published);
  assert.equal(home.includes('href="/es/ia/"'), published);
});

test('sitemap excludes resource success, draft and unselected offers', () => {
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  assert.equal(sitemap.includes('/es/ia/gracias'), false);
  assert.equal(sitemap.includes('/es/ia/kit'), false);
  assert.equal(sitemap.includes('/es/ia/taller'), false);
  assert.equal(sitemap.includes('https://hecsanchez.com/es/ia/'), aiConfig.journey === 'published');
  assert.ok(sitemap.includes('https://hecsanchez.com/es/'));
  assert.ok(sitemap.includes('https://hecsanchez.com/en/'));
});