import { expect, test, type Page } from '@playwright/test';

const toured = { 'devduo.demo': { state: { toured: true }, version: 0 } };

/** Seeds localStorage before the app loads. Values that are not strings are stored as JSON. */
const seed = (page: Page, data: Record<string, unknown>) =>
  page.addInitScript(
    (entries) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    },
    { ...toured, ...data },
  );

const guard = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
};

test.describe('tampered localStorage', () => {
  for (const [label, qty] of [['1e9', 1e9], ['-5', -5], ['"abc"', 'abc'], ['0.5', 0.5]] as const) {
    test(`cart quantity ${label} never shows a wrong total`, async ({ page }) => {
      const errors = guard(page);
      await seed(page, { 'devduo.cart': { state: { lines: [{ id: 'h7', o: 0, qty }], coupon: null }, version: 0 } });
      await page.goto('/cart');
      await expect(page.locator('header .logo')).toBeVisible();
      const body = await page.locator('main').innerText();
      expect(body).not.toMatch(/NaN|-\d|Infinity/);
      if (qty === 1e9) {
        await expect(page.getByRole('heading', { name: 'Your cart (10)' })).toBeVisible();
        await expect(page.locator('.sum .r.t')).toContainText('₹4,490');
        await page.goto('/checkout');
        await expect(page.getByRole('button', { name: /^Pay ₹4,490$/ })).toBeVisible();
      } else {
        await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
      }
      expect(errors).toEqual([]);
    });
  }

  test('lines that are not an array do not white-screen', async ({ page }) => {
    const errors = guard(page);
    await seed(page, { 'devduo.cart': { state: { lines: {}, coupon: null }, version: 0 } });
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a fake coupon is dropped and never shown as applied', async ({ page }) => {
    await seed(page, { 'devduo.cart': { state: { lines: [{ id: 'h7', o: 0, qty: 1 }], coupon: 'FREE100' }, version: 0 } });
    await page.goto('/cart');
    await expect(page.getByText(/Coupon .* applied/)).toHaveCount(0);
    await expect(page.getByLabel('Coupon code')).toBeVisible();
  });

  test('a wrong-type account shows the signed-out header', async ({ page }) => {
    const errors = guard(page);
    await seed(page, { 'devduo.auth': { state: { user: { name: 5, phone: null } }, version: 0 } });
    await page.goto('/');
    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page.locator('#acct-menu').getByRole('button', { name: 'Sign in' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('garbage in every key still opens the store', async ({ page }) => {
    const errors = guard(page);
    await seed(page, {
      'devduo.cart': '{not json',
      'devduo.auth': '[]',
      'devduo.orders': { state: { orders: 'x' }, version: 0 },
      'devduo.wishlist': { state: { ids: { a: 1 } }, version: 0 },
      'devduo.checkout': { state: { form: 5 }, version: 0 },
      'devduo.template': { state: { tpl: '../../etc' }, version: 0 },
      'devduo.theme': { state: { themes: 'garbage' }, version: 0 },
      'devduo.custom': { state: { texts: 5, images: { herbal: { a: 'https://evil.example/x.png' } } }, version: 0 },
      'devduo.themevars': '{"vars": 5}',
    });
    for (const path of ['/', '/shop', '/cart', '/checkout', '/orders', '/wishlist']) {
      await page.goto(path);
      await expect(page.locator('header .logo')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('a stored theme or image cannot make the browser request an outside URL', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await seed(page, {
      'devduo.themevars': {
        vars: {
          '--bg': 'url(https://evil.example/x.png)',
          '--primary': '#2f7d4f; background:url(https://evil.example/y.png)',
          background: 'url(https://evil.example/z.png)',
        },
        mode: 'dark',
      },
      'devduo.custom': { state: { texts: {}, images: { herbal: { 'home.0.image': 'https://evil.example/hero.png' } } }, version: 0 },
    });
    await page.goto('/');
    await expect(page.locator('header .logo')).toBeVisible();
    expect(requested.filter((u) => u.includes('evil.example'))).toEqual([]);
    await expect(page.locator('.hero-img img.hero-img-photo')).not.toHaveAttribute('src', /evil/);
  });
});

test.describe('storage full', () => {
  test('one clear message, and the app keeps working in memory', async ({ page }) => {
    await seed(page, {});
    await page.goto('/product/h7');
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('full', 'QuotaExceededError');
      };
    });
    await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.locator('#toast')).toContainText(/Browser storage is full|Added to cart/);
    await page.locator('.buy').getByRole('button', { name: 'Add to wishlist' }).click();
    await expect(page.getByRole('link', { name: 'Cart, 1 item' })).toBeVisible();
  });
});
