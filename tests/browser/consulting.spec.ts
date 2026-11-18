import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Spanish buyer paths converge on contact while the offer has no English translation', async ({ page }) => {
  await page.goto('/es/');
  const main = page.locator('main');
  await expect(main.locator('h1')).toContainText('equipos comerciales');
  await expect(main.getByRole('link', { name: 'Platiquemos de tu proceso' })).toHaveAttribute('href', '/es/contacto');
  await main.getByRole('link', { name: 'Ver cómo lo he hecho' }).click();
  await expect(page).toHaveURL(/#selected-work$/);
  const proof = page.locator('#selected-work');
  await expect(proof.locator('a[href="/es/proyectos/the-woods-crm"]')).toHaveCount(1);
  await expect(proof.locator('a[href="/es/proyectos/hubspot-lead-routing"]')).toHaveCount(1);
  await expect(proof.locator('a[href*="yepkey"]')).toHaveCount(0);
  await main.getByRole('link', { name: 'Conoce la oferta de automatización comercial' }).click();
  await expect(page).toHaveURL(/\/es\/automatizacion-comercial\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hecsanchez.com/es/automatizacion-comercial/');
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(0);
  await expect(main).toContainText('No es obligatorio contratar un diagnóstico antes.');
  await main.getByRole('link', { name: 'Platiquemos de tu proceso' }).first().click();
  await expect(page).toHaveURL(/\/es\/contacto\/?$/);
  await expect(main).toContainText('No necesitas un brief');
  await expect(page.locator('#cal-inline')).toHaveCount(1);
  for (const project of ['the-woods-crm', 'hubspot-lead-routing', 'estateflow']) {
    await page.goto(`/es/proyectos/${project}/`);
    await expect(main.getByRole('link', { name: 'Platiquemos de tu proceso' })).toHaveAttribute('href', '/es/contacto');
    await expect(main.getByRole('link', { name: 'Conoce la oferta de automatización comercial' })).toHaveAttribute('href', '/es/automatizacion-comercial/');
  }
  await page.goto('/en/');
  await expect(main.locator('h1')).toHaveText('I build the integrations and internal tools your team doesn’t have time to ship.');
  await expect(main.getByRole('link', { name: 'Discuss a project' })).toHaveAttribute('href', '/en/contact');
  await expect(main).not.toContainText('MX$');
  await expect(main.locator('a[href="/es/ia/"]')).toHaveCount(0);
  await expect(main.getByRole('link', { name: 'Explore fractional CTO support' })).toHaveAttribute('href', '/en/fractional-cto');
});

for (const width of [320, 390, 768, 1440]) {
  test(`consulting pages reflow and remain accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('https://app.cal.com/embed/embed.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/es/', '/en/', '/es/automatizacion-comercial/', '/es/como-trabajo/', '/es/contacto/']) {
      expect((await page.goto(route))?.status()).toBe(200);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
      const result = await new AxeBuilder({ page }).include('body > header').include('body > main').include('body > footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations, route).toEqual([]);
      await page.screenshot({ path: `.context/consulting-review/${route.split('/').filter(Boolean).join('-')}-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}