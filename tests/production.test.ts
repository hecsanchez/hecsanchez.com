import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { aiConfig } from '../src/features/ai/config.ts';
import { readdirSync } from 'node:fs';

test('production preserves existing professional pages, feeds and newsletter form', () => {
  for (const route of ['es', 'en', 'es/contacto', 'en/contact', 'es/privacidad', 'en/privacy', 'es/como-trabajo', 'en/how-i-work', 'es/proyectos/the-woods-crm', 'en/projects/the-woods-crm', 'es/escritos', 'en/writing']) {
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

test('Yepkey replaces current portfolio routes and preserves permanent Zaplink redirects', () => {
  for (const prefix of ['es/proyectos', 'en/projects']) {
    const page = readFileSync(`dist/${prefix}/yepkey/index.html`, 'utf8');
    assert.ok(page.includes('Yepkey.io'));
    assert.ok(page.includes('/projects/yepkey/hero.webp'));
    assert.ok(page.includes('/projects/yepkey/mobile.webp'));
    assert.ok(page.includes(`https://hecsanchez.com/${prefix}/yepkey/`));
    const redirect = readFileSync(`dist/${prefix}/zaplink/index.html`, 'utf8');
    assert.ok(redirect.includes('http-equiv="refresh"'));
    assert.ok(redirect.includes(`/${prefix}/yepkey`));
  }
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  assert.ok(sitemap.includes('/es/proyectos/yepkey/'));
  assert.ok(sitemap.includes('/en/projects/yepkey/'));
  assert.equal(sitemap.includes('/zaplink'), false);
  const deployment = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.equal(deployment.redirects.length, 4);
  for (const prefix of ['es/proyectos', 'en/projects']) {
    for (const slash of ['', '/']) {
      const rule = deployment.redirects.find((redirect: { source: string }) => redirect.source === `/${prefix}/zaplink${slash}`);
      assert.ok(rule, `HTTP redirect for /${prefix}/zaplink${slash}`);
      assert.equal(rule.destination, `/${prefix}/yepkey/`);
      assert.equal(rule.permanent, true);
    }
  }
});

test('Worker capture remains disabled and server credentials are absent from public scripts', () => {
  const workerConfig = readFileSync('workers/signups/wrangler.jsonc', 'utf8');
  for (const flag of ['SIGNUPS_ENABLED', 'RESOURCE_ENABLED', 'NEWSLETTER_CAPTURE_ENABLED', 'QUALIFICATION_ENABLED', 'PRIVACY_REVIEWED', 'RESEND_CONTACTS_VERIFIED', 'DATA_RIGHTS_VERIFIED']) {
    assert.ok(workerConfig.includes(`"${flag}": "false"`));
  }
  assert.ok(workerConfig.includes('"VERIFIED_SENDER": "true"'));
  for (const filename of readdirSync('dist/_astro').filter(name => name.endsWith('.js'))) {
    const script = readFileSync(`dist/_astro/${filename}`, 'utf8');
    assert.equal(/SIGNUPS_SERVICE_TOKEN|SIGNUPS_ADMIN_TOKEN|RESEND_API_KEY|SIGNUPS_WORKER_URL/.test(script), false, filename);
  }
});

test('privacy routes and published kit expose correct canonicals, notice and availability metadata', () => {
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  for (const [route, alternate] of [['es/privacidad', 'en/privacy'], ['en/privacy', 'es/privacidad']]) {
    const page = readFileSync(`dist/${route}/index.html`, 'utf8');
    assert.ok(page.includes(`https://hecsanchez.com/${route}/`));
    assert.ok(page.includes(`https://hecsanchez.com/${alternate}/`));
    assert.ok(page.includes('Cloudflare D1')); assert.ok(page.includes('hi@hecsanchez.com'));
    assert.ok(sitemap.includes(`https://hecsanchez.com/${route}/`));
  }
  if (aiConfig.journey === 'published') {
    const landing = readFileSync('dist/es/ia/index.html', 'utf8');
    const success = readFileSync('dist/es/ia/gracias/index.html', 'utf8');
    assert.ok(landing.includes('data-enabled="true"'));
    assert.ok(landing.includes('Guía v1.1 de 10 páginas'));
    assert.ok(landing.includes('/es/privacidad/'));
    assert.equal(landing.includes('name="robots"'), false);
    assert.ok(success.includes('noindex, nofollow'));
    assert.ok(success.includes('id="access-ready" hidden'));
  }
});