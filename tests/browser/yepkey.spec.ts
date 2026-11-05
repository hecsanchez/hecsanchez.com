import { test, expect } from '@playwright/test';

for (const [locale, prefix, otherPrefix] of [['es', '/es/proyectos', '/en/projects'], ['en', '/en/projects', '/es/proyectos']]) {
  test(`${locale}: Yepkey screenshots, responsive project and legacy redirects`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`${prefix}/yepkey/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body > main h1').first()).toHaveText('Yepkey.io');
      await expect(page.locator('a[href="https://yepkey.io/"]')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://hecsanchez.com${prefix}/yepkey/`);
      await expect(page.locator('link[hreflang="' + (locale === 'es' ? 'en' : 'es') + '"]')).toHaveAttribute('href', `https://hecsanchez.com${otherPrefix}/yepkey/`);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://hecsanchez.com/projects/yepkey/hero.webp');
      const screenshots = page.locator('main img[src^="/projects/yepkey/"]');
      await expect(screenshots).toHaveCount(2);
      for (const image of await screenshots.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
        expect(await image.getAttribute('alt')).toContain('Yepkey.io');
        expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
        expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
      await page.screenshot({ path: `.context/yepkey-review/${locale}-${width}.png`, fullPage: true });
    }
    for (const suffix of ['', '/']) {
      const response = await page.goto(`${prefix}/zaplink${suffix}`);
      expect(response?.status()).toBe(200);
      const redirect = response?.request().redirectedFrom();
      expect(await redirect?.response().then(result => result?.status())).toBe(301);
      await expect(page).toHaveURL(new RegExp(`${prefix}/yepkey/?$`));
      await expect(page.locator('body > main h1').first()).toHaveText('Yepkey.io');
    }
    await page.goto(`${prefix}/#zaplink`);
    await expect(page.locator('#yepkey #zaplink')).toHaveCount(1);
    await expect(page.locator('#yepkey a').filter({ hasText: 'Yepkey.io' })).toHaveAttribute('href', `${prefix}/yepkey`);
    expect(errors).toEqual([]);
  });
}

test('current portfolio entries use Yepkey while dated posts explain the former name', async ({ page }) => {
  for (const [locale, projectPath, articlePath] of [
    ['es', '/es/proyectos/yepkey', '/es/escritos/un-producto-que-funciona-es-una-forma-muy-convincente-de-evitar-vender/'],
    ['en', '/en/projects/yepkey', '/en/writing/a-working-product-is-a-very-convincing-way-to-avoid-selling/'],
  ]) {
    await page.goto(`/${locale}/`);
    const card = page.locator(`a[href="${projectPath}"]`);
    await expect(card).toHaveCount(1);
    await expect(card.locator('h3')).toHaveText('Yepkey.io');
    await expect(card.locator('img')).toHaveAttribute('src', '/projects/yepkey/hero.webp');
    await page.goto(articlePath);
    await expect(page.locator(`main a[href="${projectPath}"]`).first()).toHaveText(locale === 'es' ? 'Yepkey (entonces llamado Zaplink)' : 'Yepkey (then called Zaplink)');
    await expect(page.locator('main a[href$="/zaplink"]')).toHaveCount(0);
  }
});