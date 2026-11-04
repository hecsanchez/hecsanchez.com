import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

for (const width of [320, 390, 768, 1440]) {
  test(`draft journey at ${width}px: reflow, fiction, anchors, safe form and access`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const operations: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/\/api\/ai-|plausible\.io/.test(request.url())) operations.push(request.url()); });
    await page.goto('/es/ia/?utm_source=tiktok&utm_medium=organic_social&utm_campaign=ia_30_dias&utm_content=w01_d01_a&email=private@example.invalid');
    await expect(page.locator('main h1')).toHaveText('Pon la IA a trabajar con la información de tu negocio.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hecsanchez.com/es/ia/');
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
    await expect(page.getByText('Ejemplo ilustrativo con datos ficticios', { exact: true })).toHaveCount(2);
    await expect(page.locator('a[href*="/en/ia"]')).toHaveCount(0);
    await expect(page.locator('[data-resource-request] input[type="email"]')).toBeDisabled();
    await expect(page.locator('[data-resource-request] input[type="checkbox"]')).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.ai-bio img').scrollIntoViewIfNeeded();
    await expect(page.locator('.ai-bio img')).toHaveJSProperty('complete', true);
    expect(await page.locator('.ai-bio img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await page.evaluate(() => scrollTo(0, 0));
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `.context/screenshots/ia-${width}.png`, fullPage: true });
    await page.getByRole('link', { name: 'Ver un ejemplo', exact: false }).click();
    await expect(page.locator('#ejemplo')).toBeFocused();
    await page.locator('.ai-hero .ai-button').click();
    await expect(page.locator('#kit')).toBeFocused();
    await expect(page.locator('.ai-availability')).toBeVisible();
    await page.locator('.ai-form-card').screenshot({ path: `.context/screenshots/form-unavailable-${width}.png` });
    const results = await new AxeBuilder({ page }).include('body > header').include('.ai').include('body > footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.goto('/es/ia/gracias/');
    await expect(page.locator('main h1')).toHaveText('Acceso al Kit Contexto');
    await expect(page.locator('#qualification')).toBeHidden();
    await expect(page.locator('#access-ready')).toBeHidden();
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `.context/screenshots/gracias-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(operations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('development Spanish entry and existing language routes remain available', async ({ page }) => {
  for (const route of ['/es/', '/en/', '/es/proyectos/the-woods-crm/', '/en/projects/the-woods-crm/', '/es/escritos/', '/en/writing/', '/es/como-trabajo/', '/es/contacto/', '/en/contact/']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('body > main h1').first()).toBeVisible();
  }
  await page.goto('/es/');
  await expect(page.getByRole('link', { name: 'Explorar IA para negocios', exact: true })).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-nav-toggle').click();
  await expect(page.locator('#mobile-nav a[href="/es/ia/"]')).toBeVisible();
  const missing = await page.goto('/es/ia/taller/');
  expect(missing?.status()).toBe(404);
});

test('keyboard focus and reduced motion keep section destinations usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/ia/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Saltar al contenido', { exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Ver un ejemplo', exact: false }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#ejemplo')).toBeFocused();
  expect(await page.locator('#ejemplo').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
});

test('published-click fixture sends only controlled data and never claims accepted requests', async ({ page }) => {
  await page.goto('/es/ia/?utm_source=tiktok&utm_content=bio&email=private@example.invalid&source=secret');
  await page.evaluate(() => {
    // Browser-only test sink. This cannot enable the server or publish a route.
    const events: unknown[] = [];
    Object.assign(window, { aiTestEvents: events, plausible: (...args: unknown[]) => events.push(args) });
    const root = document.querySelector<HTMLElement>('[data-ai-published]')!;
    root.dataset.aiPublished = 'true'; root.dataset.resourceId = 'test-resource';
  });
  await page.locator('.ai-hero .ai-button').click();
  const events = await page.evaluate(() => (window as unknown as { aiTestEvents: unknown[] }).aiTestEvents);
  expect(events).toHaveLength(1);
  expect(events[0]).toEqual(['kit_cta_click', { props: { locale: 'es', environment: 'production', utm_source: 'tiktok', utm_content: 'bio', placement: 'hero', resource_id: 'test-resource', creative: 'unknown' }, url: expect.stringContaining('/es/ia/?utm_source=tiktok&utm_content=bio') }]);
  expect(JSON.stringify(events)).not.toContain('private@example.invalid');
  expect(JSON.stringify(events)).not.toContain('secret');
  await page.goto('/es/ia/gracias/');
  await expect(page.locator('#access-ready')).toBeHidden();
});

test('reproducible mobile loading lab records LCP and CLS without claiming field INP', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const failed: string[] = [];
  page.on('requestfailed', request => failed.push(new URL(request.url()).hostname));
  await page.addInitScript(() => {
    const metrics = { lcp: 0, cls: 0, shifts: [] as unknown[] };
    Object.assign(window, { aiLab: metrics });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) metrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number; sources: { node: Element; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] })[]) if (!entry.hadRecentInput) { metrics.cls += entry.value; metrics.shifts.push({ value: entry.value, sources: entry.sources.map(source => ({ element: source.node?.tagName, class: source.node?.className, previous: source.previousRect, current: source.currentRect })) }); } }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/es/ia/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const metrics = await page.evaluate(() => ({ ...(window as unknown as { aiLab: { lcp: number; cls: number } }).aiLab, transferredBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0) }));
  await mkdir('.context', { recursive: true });
  await writeFile('.context/mobile-lab.json', JSON.stringify({ conditions: 'Chromium, Astro dev preview, cold browser cache, 390×844 CSS px, 4× CPU slowdown, 150ms latency, 1.6Mbps down/750Kbps up; no production bundle or field INP claim', metrics, failedHosts: [...new Set(failed)] }, null, 2));
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
});