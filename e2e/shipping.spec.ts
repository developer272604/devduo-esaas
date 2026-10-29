import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, tpl: string, lines: { id: string; qty: number }[]) {
  await page.addInitScript(
    ([tpl, lines]) => {
      localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
      localStorage.setItem('devduo.cart', JSON.stringify({ state: { lines: lines.map((l) => ({ id: l.id, o: 0, qty: l.qty })), coupon: null }, version: 0 }));
    },
    [tpl, lines] as const,
  );
}

test.describe('free delivery: the banner, the cart and the checkout agree', () => {
  test('herbal: a ₹499 item is exactly enough', async ({ page }) => {
    await start(page, 'herbal', [{ id: 'h1', qty: 1 }]); // Wild Honey 250 g, ₹499
    await page.goto('/cart');
    await expect(page.locator('header .announce')).toContainText('above ₹499');
    await expect(page.locator('.sum small.g')).toHaveText('You have free delivery');
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('Free');
    await expect(page.locator('.sum .r.t')).toContainText('₹499');
  });

  test('herbal: ₹249 is ₹250 short, and the checkout says the same threshold', async ({ page }) => {
    await start(page, 'herbal', [{ id: 'h5', qty: 1 }]); // Neem Leaf Powder, ₹249
    await page.goto('/cart');
    await expect(page.locator('.sum small')).toContainText('Add ₹250 more for free delivery');
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('₹59');
    await page.goto('/checkout');
    await expect(page.getByText('Free over ₹499, otherwise ₹59')).toBeVisible();
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('₹59');
  });

  test('fashion: ₹1,999 is ₹1 short of the ₹2,000 promise; two are free', async ({ page }) => {
    await start(page, 'fashion', [{ id: 'f1', qty: 1 }]); // ₹1,999
    await page.goto('/cart');
    await expect(page.locator('header .announce')).toContainText('above ₹2,000');
    await expect(page.locator('.sum small')).toContainText('Add ₹1 more for free delivery');
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('₹59');
    await page.getByRole('button', { name: /Increase quantity/ }).click();
    await expect(page.locator('.sum small.g')).toHaveText('You have free delivery');
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('Free');
  });

  test('the product page perk shows the template threshold', async ({ page }) => {
    await start(page, 'fashion', []);
    await page.goto('/product/f1');
    await expect(page.locator('.perks')).toContainText('Free delivery over ₹2,000');
  });

  test('FREESHIP makes any herbal cart free, and removing it brings the fee back', async ({ page }) => {
    await start(page, 'herbal', [{ id: 'h5', qty: 1 }]);
    await page.goto('/cart');
    await page.getByLabel('Coupon code').fill('FREESHIP');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.sum small.g')).toHaveText('You have free delivery');
    await expect(page.getByText('Coupon FREESHIP applied.')).toBeVisible();
    await page.locator('.sum .hint').getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByLabel('Coupon code')).toBeVisible();
    await expect(page.locator('.sum .r', { hasText: 'Delivery' })).toContainText('₹59');
  });
});
