import { expect, test } from '@playwright/test';

test.describe('saved data from before the rename', () => {
  test('is moved to the new keys on first load, and the store opens with it', async ({ page }) => {
    await page.goto('/'); // any page, to get at this origin's storage
    await page.evaluate(() => {
      const put = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
      localStorage.clear();
      put('vilvad2c.demo', { state: { toured: true }, version: 0 });
      put('vilvad2c.template', { state: { tpl: 'fashion' }, version: 0 });
      put('vilvad2c.cart', { state: { lines: [{ id: 'f11', o: 0, qty: 2 }], coupon: null }, version: 0 });
      put('vilvad2c.custom', { state: { texts: { fashion: { 'brand.name': 'Asha Boutique' } }, images: {} }, version: 0 });
    });
    await page.reload();

    await expect(page.locator('header .logo')).toContainText('Asha Boutique');
    await expect(page.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toHaveCount(0); // the tour flag came along

    const keys = await page.evaluate(() => Object.keys(localStorage).sort());
    expect(keys.filter((k) => k.startsWith('vilvad2c.'))).toEqual([]);
    for (const k of ['devduo.cart', 'devduo.template', 'devduo.custom', 'devduo.demo']) expect(keys).toContain(k);
  });

  test('a value already saved under the new key is not overwritten', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl: 'gadgets' }, version: 0 }));
      localStorage.setItem('vilvad2c.template', JSON.stringify({ state: { tpl: 'fashion' }, version: 0 }));
    });
    await page.reload();
    await expect(page.locator('header .logo')).toContainText('MobiStore');
    expect(await page.evaluate(() => localStorage.getItem('vilvad2c.template'))).toBeNull();
  });
});

test.describe('static brand metadata', () => {
  test('the HTML itself carries the brand, before any script runs', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('<title>Devduo ESaas – storefront demo</title>');
    expect(html).toContain('<meta property="og:site_name" content="Devduo ESaas"');
    expect(html).toContain('<meta property="og:title" content="Devduo ESaas – storefront demo"');
    expect(html).toContain('<meta property="og:description"');
    expect(html).toContain('<meta property="og:type" content="website"');
    expect(html).toContain('<meta name="theme-color"');
    expect(html).toContain('<meta name="description"');
    expect(html.toLowerCase()).not.toMatch(/vilva|d2c/);
  });
});

test.describe('new ids in the real purchase flow', () => {
  test('order id starts with DD and the tracking link follows it', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      localStorage.setItem('devduo.cart', JSON.stringify({ state: { lines: [{ id: 'h7', o: 0, qty: 1 }], coupon: null }, version: 0 }));
      localStorage.setItem('devduo.auth', JSON.stringify({ state: { user: { name: 'Asha Rao', phone: '9876543210' } }, version: 0 }));
    });
    await page.goto('/checkout');
    await page.getByLabel('Full name').fill('Asha Rao');
    await page.getByLabel('Mobile number').fill('9876543210');
    await page.getByLabel('Address', { exact: true }).fill('12 Lake View Road');
    await page.getByLabel('City').fill('Chennai');
    await page.getByLabel('Pincode').fill('600001');
    await page.getByLabel('State').fill('Tamil Nadu');
    await page.getByLabel('Cash on delivery').check();
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible({ timeout: 10_000 });
    const id = (await page.locator('[data-order-id]').innerText()).trim();
    expect(id).toMatch(/^DD[0-9A-F]{8}$/);
    await expect(page.getByLabel('WhatsApp message preview')).toContainText(`devduo.link/${id.toLowerCase()}`);
    await expect(page.getByLabel('WhatsApp message preview')).toContainText('Devduo Business');
  });
});
