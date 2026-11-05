import { test, expect } from '@playwright/test';

test('all newsletter placements send explicit source and locale, with no identity in URLs or retry storage', async ({ page }) => {
  for (const [route, locale, placement, floating] of [
    ['/es/', 'es', 'home', false], ['/en/', 'en', 'home', false],
    ['/es/escritos/', 'es', 'writing_index', false], ['/en/writing/', 'en', 'writing_index', false],
    ['/es/escritos/cuando-puedes-construir-casi-cualquier-cosa/', 'es', 'writing_post', true],
    ['/en/writing/when-you-can-build-almost-anything/', 'en', 'writing_post', true],
  ] as const) {
    let submitted: Record<string, unknown> | null = null;
    await page.route('**/api/subscribe', async interception => {
      expect(interception.request().url()).not.toContain('@');
      submitted = interception.request().postDataJSON();
      await interception.fulfill({ json: { ok: true, confirm: true } });
    });
    await page.goto(route);
    const form = page.locator('form[data-newsletter]');
    if (floating) await page.locator('.subscribe-trigger').scrollIntoViewIfNeeded();
    await form.locator('[name="email"]').fill('fictional+browser@example.invalid');
    await form.locator('button[type="submit"]').click();
    await expect(form).toBeHidden();
    expect(submitted).toMatchObject({ email: 'fictional+browser@example.invalid', locale, placement });
    expect(submitted).toHaveProperty('idempotencyKey', expect.stringMatching(/^[a-f\d-]{36}$/i));
    const storage = await page.evaluate(() => JSON.stringify({ ...sessionStorage }));
    expect(storage).not.toContain('fictional');
    await page.unroute('**/api/subscribe');
  }
});

test('uncertain newsletter submission retains one retry key across reload and truthful recorded state', async ({ page }) => {
  const keys: string[] = [];
  let succeed = false;
  await page.route('**/api/subscribe', async interception => {
    keys.push(interception.request().postDataJSON().idempotencyKey);
    await interception.fulfill({ status: succeed ? 202 : 503, json: succeed ? { ok: true, recorded: true } : { ok: false, error: 'private provider text' } });
  });
  await page.goto('/es/');
  let form = page.locator('form[data-newsletter]');
  await form.locator('[name="email"]').fill('fictional+retry@example.invalid');
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#subscribe-block-status')).not.toContainText('private provider text');
  await expect(form.locator('button[type="submit"]')).toBeEnabled();
  await page.reload();
  succeed = true; form = page.locator('form[data-newsletter]');
  await form.locator('[name="email"]').fill('fictional+retry@example.invalid');
  await form.locator('button[type="submit"]').click();
  await expect(form).toBeHidden();
  await expect(page.locator('#subscribe-block-status')).toHaveText('Solicitud recibida. Estamos procesando el alta.');
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});