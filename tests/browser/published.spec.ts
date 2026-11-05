import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { kitAsset } from '../../src/features/signups/kit.ts';

for (const width of [320, 390, 768, 1440]) {
  test(`published kit at ${width}px: actual contents, acceptance, failed email and optional profile`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = []; const saved: unknown[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/ai-resource', route => route.fulfill({ json: { ok: true, next: '/es/ia/gracias/', asset: kitAsset, delivery: 'failed' } }));
    await page.route('**/api/ai-context', route => route.fulfill({ json: { ok: true, asset: kitAsset, delivery: 'failed', profileAllowed: true } }));
    await page.route('**/api/ai-profile', async route => { saved.push(route.request().postDataJSON()); await route.fulfill({ json: { ok: true } }); });
    await page.goto('/es/ia/?utm_source=tiktok&utm_content=bio&email=private@example.invalid');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('.ai-draft')).toHaveCount(0);
    await expect(page.locator('[data-resource-request] input[type="email"]')).toBeEnabled();
    await expect(page.locator('[name="marketingConsent"]')).not.toBeChecked();
    await expect(page.getByText('Guía v1.1 de 10 páginas para elegir una tarea y preparar una prueba.')).toBeVisible();
    await expect(page.locator('a[href="/es/privacidad/"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const landingAxe = await new AxeBuilder({ page }).include('body > header').include('.ai').include('body > footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(landingAxe.violations).toEqual([]);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `.context/production-review/ia-${width}.png`, fullPage: true });
    await page.locator('[name="email"]').fill('fictional+published@example.invalid');
    await page.locator('[data-resource-request] button[type="submit"]').click();
    await expect(page).toHaveURL(/\/es\/ia\/gracias\/$/);
    await expect(page.locator('#access-ready')).toBeVisible();
    await expect(page.locator('#resource-access')).toHaveAttribute('href', kitAsset.url);
    await expect(page.locator('#access-delivery')).toHaveText('Puedes acceder al kit aquí. No pudimos enviar el correo en este momento.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('#qualification')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).include('body > header').include('.ai').include('body > footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations).toEqual([]);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `.context/production-review/gracias-access-${width}.png`, fullPage: true });
    await page.locator('[name="role"]').selectOption('operations');
    await page.locator('[name="task"]').fill('Review a fictional recurring task');
    await page.locator('[name="frequency"]').selectOption('weekly');
    await page.locator('#ai-profile button[type="submit"]').click();
    await expect(page.locator('#ai-profile-status')).toHaveText('Gracias. Tus respuestas quedaron guardadas.');
    expect(saved).toEqual([{ role: 'operations', task: 'Review a fictional recurring task', frequency: 'weekly' }]);
    expect(errors).toEqual([]);
  });
}

test('direct access stays neutral and emits no request/profile event; expired profile never removes download', async ({ page }) => {
  await page.addInitScript(() => {
    const events: unknown[] = [];
    Object.assign(window, { publicationEvents: events, plausible: (...args: unknown[]) => events.push(args) });
  });
  await page.route('**/api/ai-context', route => route.fulfill({ status: 401, json: { ok: false, code: 'expired' } }));
  await page.goto('/es/ia/gracias/');
  await expect(page.locator('#access-ready')).toBeHidden(); await expect(page.locator('#qualification')).toBeHidden();
  await expect(page.locator('main h1')).toHaveText('Acceso al Kit Contexto');
  expect(await page.evaluate(() => (window as unknown as { publicationEvents: unknown[] }).publicationEvents)).toEqual([]);
  await page.unroute('**/api/ai-context');
  await page.route('**/api/ai-context', route => route.fulfill({ json: { ok: true, asset: kitAsset, delivery: 'sent', profileAllowed: true } }));
  await page.route('**/api/ai-profile', route => route.fulfill({ status: 401, json: { ok: false, code: 'expired' } }));
  await page.reload();
  await page.locator('[name="role"]').selectOption('owner'); await page.locator('[name="task"]').fill('Fictional task');
  await page.locator('#ai-profile button[type="submit"]').click();
  await expect(page.locator('#ai-profile-status')).toContainText('expiró');
  await expect(page.locator('#resource-access')).toHaveAttribute('href', kitAsset.url);
  await page.locator('#skip-profile').click(); await expect(page.locator('#qualification')).toBeHidden();
  await expect(page.locator('#resource-access')).toBeFocused();
  expect(await page.evaluate(() => (window as unknown as { publicationEvents: unknown[] }).publicationEvents)).toEqual([]);
});

test('uncertain kit submission reuses its key after reload; source and consent stay bounded', async ({ page }) => {
  const requests: Record<string, unknown>[] = []; let success = false;
  await page.route('**/api/ai-resource', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: success ? 200 : 503, json: success ? { ok: true, asset: kitAsset } : { ok: false } });
  });
  await page.route('**/api/ai-context', route => route.fulfill({ json: { ok: true, asset: kitAsset, delivery: 'queued', profileAllowed: false } }));
  await page.goto('/es/ia/?utm_source=instagram&utm_content=bio&email=secret@example.invalid');
  await page.locator('[name="email"]').fill('fictional+retry@example.invalid');
  await page.locator('[data-resource-request] button[type="submit"]').click();
  await expect(page.locator('#ai-request-status')).toContainText('No pudimos completar');
  await page.reload(); success = true;
  await page.locator('[name="email"]').fill('fictional+retry@example.invalid');
  await page.locator('[data-resource-request] button[type="submit"]').click();
  await expect(page.locator('#resource-access')).toBeVisible();
  expect(requests).toHaveLength(2); expect(requests[0].idempotencyKey).toBe(requests[1].idempotencyKey);
  expect(requests[1].marketingConsent).toBe(false);
  expect(JSON.stringify(requests[1].attribution)).not.toContain('secret');
});

test('both privacy notices link reciprocally and explain real purposes and deletion', async ({ page }) => {
  for (const [locale, route, alternate, title] of [['es', '/es/privacidad/', '/en/privacy/', 'Aviso de privacidad'], ['en', '/en/privacy/', '/es/privacidad/', 'Privacy notice']] as const) {
    await page.goto(route);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hecsanchez.com${route}`);
    await expect(page.locator(`link[hreflang="${locale === 'es' ? 'en' : 'es'}"]`)).toHaveAttribute('href', `https://hecsanchez.com${alternate}`);
    await expect(page.locator('main')).toContainText('Cloudflare D1'); await expect(page.locator('main')).toContainText('Resend');
    await expect(page.locator('main a[href="mailto:hi@hecsanchez.com"]')).toBeVisible();
    const axe = await new AxeBuilder({ page }).include('main').include('body > footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations).toEqual([]);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `.context/production-review/privacy-${locale}.png`, fullPage: true });
  }
});