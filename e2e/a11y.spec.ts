import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const TEMPLATES = ['herbal', 'gadgets', 'fashion', 'marketplace', 'wellness'] as const;
const CART_ITEM: Record<(typeof TEMPLATES)[number], string> = { herbal: 'h7', gadgets: 'g6', fashion: 'f11', marketplace: 'm9', wellness: 'w8' };
const PRODUCT: Record<(typeof TEMPLATES)[number], string> = { herbal: 'h3', gadgets: 'g6', fashion: 'f1', marketplace: 'm1', wellness: 'w1' };
const CATEGORY: Record<(typeof TEMPLATES)[number], string> = { herbal: 'honey', gadgets: 'phones', fashion: 'kurtis', marketplace: 'home', wellness: 'gut' };
const ROUTES = ['/', '/shop', '/category/CAT', '/product/PROD', '/search?q=a', '/search?q=zzzz', '/wishlist', '/cart', '/checkout', '/orders', '/success/none', '/nope'];

async function open(page: Page, path: string, tpl: (typeof TEMPLATES)[number], opts: { cart?: boolean; toured?: boolean; user?: boolean } = {}) {
  const { cart = true, toured = true, user = false } = opts;
  await page.addInitScript(
    ([tpl, item, cart, toured, user]) => {
      if (toured) localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
      if (cart) localStorage.setItem('devduo.cart', JSON.stringify({ state: { lines: [{ id: item, o: 0, qty: 1 }], coupon: null }, version: 0 }));
      if (user) localStorage.setItem('devduo.auth', JSON.stringify({ state: { user: { name: 'Asha Rao', phone: '9876543210' } }, version: 0 }));
    },
    [tpl, CART_ITEM[tpl], cart, toured, user] as const,
  );
  await page.goto(path.replace('CAT', CATEGORY[tpl]).replace('PROD', PRODUCT[tpl]));
  await expect(page.locator('header .logo')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const scan = async (page: Page, include?: string) => {
  let b = new AxeBuilder({ page }).withTags(TAGS);
  if (include) b = b.include(include);
  const r = await b.analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
};

for (const width of [390, 1440]) {
  test.describe(`axe at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const tpl of TEMPLATES) {
      test(`${tpl} home`, async ({ page }) => {
        await open(page, '/', tpl);
        expect(await scan(page)).toEqual([]);
      });
    }
    for (const route of ROUTES.slice(1)) {
      test(`herbal ${route}`, async ({ page }) => {
        await open(page, route, 'herbal');
        expect(await scan(page)).toEqual([]);
      });
    }
  });
}

test.describe('one h1 per page', () => {
  for (const tpl of TEMPLATES) {
    for (const route of ROUTES) {
      test(`${tpl} ${route}`, async ({ page }) => {
        await open(page, route, tpl);
        const heads = await page.evaluate(() => [...document.querySelectorAll('h1')].map((h) => h.textContent?.trim()));
        expect(heads, `h1s: ${heads.join(' | ')}`).toHaveLength(1);
      });
    }
  }
});

test.describe('dialogs and tools', () => {
  test('edit mode on the home page is clean', async ({ page }) => {
    await open(page, '/', 'herbal');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    expect(await scan(page)).toEqual([]);
  });

  test('sign-in dialog, settings drawer, tour and screenshot dialog are clean', async ({ page }) => {
    await open(page, '/', 'herbal');
    await page.getByRole('button', { name: 'Account' }).click();
    await page.locator('#acct-menu').getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
    expect(await scan(page, '[role="dialog"]')).toEqual([]);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Storefront settings' })).toBeVisible();
    expect(await scan(page, '#drawer')).toEqual([]);
    await page.getByRole('button', { name: 'Close settings' }).click();

    await page.getByTestId('screenshot').click();
    await expect(page.getByRole('dialog', { name: 'Screenshot ready' })).toBeVisible({ timeout: 45_000 });
    expect(await scan(page, '[role="dialog"]')).toEqual([]);
  });

  test('the first-visit tour is clean', async ({ page }) => {
    await open(page, '/', 'herbal', { toured: false });
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toBeVisible();
    expect(await scan(page, '[role="dialog"]')).toEqual([]);
  });

  test('checkout with errors is clean', async ({ page }) => {
    await open(page, '/checkout', 'herbal');
    await page.getByRole('button', { name: /^Pay / }).click();
    await expect(page.getByText('Enter your full name.')).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
});
