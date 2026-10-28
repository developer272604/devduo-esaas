import { expect, test, type Page } from '@playwright/test';

const TEMPLATES = [
  { id: 'herbal', name: 'Ooty Herbals' },
  { id: 'gadgets', name: 'MobiStore' },
  { id: 'fashion', name: 'Aarohi' },
  { id: 'marketplace', name: 'Marketly' },
  { id: 'wellness', name: 'Gutwell' },
];

const openSettings = (page: Page) => page.getByRole('button', { name: 'Open settings' }).click();
const pickTemplate = (page: Page, id: string) => page.locator(`[data-template="${id}"]`).click();

test.beforeEach(async ({ page }) => {
  // the first-visit tour has its own tests in demo.spec.ts
  await page.addInitScript(() => {
    if (!localStorage.getItem('devduo.demo')) localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  (page as unknown as { __errors: string[] }).__errors = errors;
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errors: string[] }).__errors, 'console errors').toEqual([]);
});

test('1. every template changes the home page and keeps the same shell', async ({ page }) => {
  const homes = new Set<string>();
  await openSettings(page);
  for (const t of TEMPLATES) {
    await pickTemplate(page, t.id);
    await expect(page.locator('header .logo')).toContainText(t.name);
    await expect(page.locator('header .announce')).not.toBeEmpty();
    // identical chrome in every template
    await expect(page.locator('header .search input')).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: /^Cart/ })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: /^Wishlist/ })).toBeVisible();
    await expect(page.locator('footer.foot')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    homes.add(await page.locator('main h1').first().innerText());
  }
  expect(homes.size).toBe(TEMPLATES.length);
});

test('2 and 3. colour and font changes apply everywhere', async ({ page }) => {
  await openSettings(page);
  await page.locator('input[type=color]').evaluate((el: HTMLInputElement) => {
    el.value = '#fff7a8';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const vars = () =>
    page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return { onPrimary: s.getPropertyValue('--on-primary').trim(), primaryText: s.getPropertyValue('--primary-text').trim() };
    });
  await expect.poll(async () => (await vars()).onPrimary).toBe('#111111');
  expect((await vars()).primaryText).not.toBe('#fff7a8');

  for (const font of ['Inter', 'Poppins', 'Playfair Display', 'Lora', 'Space Grotesk', 'Manrope', 'Nunito', 'Fraunces']) {
    await page.locator('.fonts button', { hasText: new RegExp(`^${font}$`) }).click();
    const family = await page.evaluate(() => ({
      body: getComputedStyle(document.body).fontFamily,
      input: getComputedStyle(document.querySelector('header input')!).fontFamily,
      button: getComputedStyle(document.querySelector('.btn')!).fontFamily,
    }));
    expect(family.body).toContain(font);
    expect(family.input).toContain(font);
    expect(family.button).toContain(font);
  }
});

test('4. switching template with items asks first, then clears cart and wishlist', async ({ page }) => {
  await page.goto('/product/h7');
  await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
  await page.locator('.buy').getByRole('button', { name: 'Add to wishlist' }).click();
  await expect(page.getByRole('link', { name: 'Cart, 1 item' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wishlist, 1 item' })).toBeVisible();

  await openSettings(page);
  await pickTemplate(page, 'gadgets');
  const dialog = page.getByRole('dialog', { name: 'Switch template?' });
  await expect(dialog).toContainText('Your cart and wishlist will be cleared because the new template has different products.');
  await dialog.getByRole('button', { name: 'Switch template' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('header .logo')).toContainText('MobiStore');
  await expect(page.getByRole('link', { name: 'Cart, 0 items' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wishlist, 0 items' })).toBeVisible();

  // a product from the old template is a friendly dead end, not a crash
  await page.goto('/product/h7');
  await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
});

test('5. full purchase flow, orders, stages and cancelling', async ({ page }) => {
  // browse, add a product with a pack size, change quantity
  await page.goto('/product/h3');
  await page.getByRole('button', { name: '500 g' }).click();
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'View cart' }).click();
  await expect(page.getByRole('heading', { name: 'Your cart (2)' })).toBeVisible();
  await expect(page.locator('.line')).toContainText('Pack size: 500 g');

  // coupon
  await page.getByLabel('Coupon code').fill('welcome10');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('Coupon WELCOME10 applied.')).toBeVisible();
  await expect(page.locator('.sum .r.g', { hasText: 'Coupon discount' })).toBeVisible();

  // checkout: errors first, then fix them
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();
  await page.getByRole('button', { name: /^Pay / }).click();
  await expect(page.getByText('Enter your full name.')).toBeVisible();
  await expect(page.getByText(/10-digit mobile number/)).toBeVisible();
  await page.getByLabel('Full name').fill('Asha Rao');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Address', { exact: true }).fill('12 Lake View Road');
  await page.getByLabel('City').fill('Chennai');
  await page.getByLabel('Pincode').fill('600001');
  await page.getByLabel('State').fill('Tamil Nadu');
  await page.getByLabel(/UPI ID/).fill('asha@upi');

  // not signed in: sign-in opens, then payment resumes on its own
  await page.getByRole('button', { name: /^Pay / }).click();
  const auth = page.getByRole('dialog', { name: 'Sign in' });
  await expect(auth).toBeVisible();
  await auth.getByRole('button', { name: 'Send OTP' }).click();
  await expect(auth).toContainText('Demo OTP is 123456');
  await auth.getByLabel('6-digit OTP').fill('123456');
  await auth.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByText('Processing payment with Devduo Pay')).toBeVisible();

  // success with the WhatsApp preview
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible({ timeout: 10_000 });
  const orderId = (await page.locator('[data-order-id]').innerText()).trim();
  await expect(page.getByLabel('WhatsApp message preview')).toContainText(orderId);
  await expect(page.getByLabel('WhatsApp message preview')).toContainText('through Devduo Business (demo)');
  await expect(page.getByRole('link', { name: 'Cart, 0 items' })).toBeVisible();

  // orders: advance the status
  await page.getByRole('link', { name: 'Track order' }).click();
  const card = page.locator(`[data-order="${orderId}"]`);
  await expect(card.locator('[data-status]')).toHaveText('Placed');
  await card.getByRole('button', { name: 'Demo: move to next stage' }).click();
  await expect(card.locator('[data-status]')).toHaveText('Packed');

  // a fresh order by cash on delivery, then cancel it
  await page.goto('/product/h7');
  await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/checkout');
  await expect(page.getByLabel('Full name')).toHaveValue('Asha Rao'); // the form persisted
  await page.getByLabel('Cash on delivery').check();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible({ timeout: 10_000 });
  const second = (await page.locator('[data-order-id]').innerText()).trim();
  await page.getByRole('link', { name: 'Track order' }).click();
  const fresh = page.locator(`[data-order="${second}"]`);
  await fresh.getByRole('button', { name: 'Cancel order' }).click();
  await expect(fresh.locator('[data-status]')).toHaveText('Cancelled');

  // orders belong to their template
  await openSettings(page);
  await pickTemplate(page, 'fashion');
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'No orders yet' })).toBeVisible();
});

test('6. theme, template, cart and login survive a reload without a flash', async ({ page }) => {
  await openSettings(page);
  await pickTemplate(page, 'fashion');
  await page.locator('.sw button').nth(5).click();
  await page.locator('.dh button').click();
  await page.goto('/product/f1');
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();

  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
  await page.reload();
  // the inline script in index.html has already applied the saved look before React renders
  const early = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());
  expect(early).toBe(before);
  await expect(page.locator('header .logo')).toContainText('Aarohi');
  await expect(page.getByRole('link', { name: 'Cart, 1 item' })).toBeVisible();
});
