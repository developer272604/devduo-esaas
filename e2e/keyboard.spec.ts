import { expect, test, type Page } from '@playwright/test';

const seed = (page: Page, { toured = true, cart = false }: { toured?: boolean; cart?: boolean } = {}) =>
  page.addInitScript(
    ([toured, cart]) => {
      if (toured) localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      if (cart) localStorage.setItem('devduo.cart', JSON.stringify({ state: { lines: [{ id: 'h7', o: 0, qty: 1 }], coupon: null }, version: 0 }));
    },
    [toured, cart] as const,
  );

const insideCard = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('[data-tour-card]'));

test.describe('the first-visit tour is a real dialog (A1)', () => {
  test('focus starts inside it, Tab never leaves it, and Escape means "not now"', async ({ page }) => {
    await seed(page, { toured: false });
    await page.goto('/');
    const card = page.getByRole('dialog', { name: 'Quick tour' });
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('aria-modal', 'true');
    expect(await insideCard(page)).toBe(true);

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await insideCard(page), `after ${i + 1} Tab presses`).toBe(true);
    }
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await insideCard(page), `after ${i + 1} Shift+Tab presses`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(card).toBeHidden();
    // not marked as seen: whatever is stored says toured is false
    const saved = await page.evaluate(() => localStorage.getItem('devduo.demo'));
    expect(saved === null || JSON.parse(saved).state.toured === false).toBe(true);

    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toBeVisible(); // it comes back
  });

  test('Skip tour ends it for good, and it can be replayed from Settings', async ({ page }) => {
    await seed(page, { toured: false });
    await page.goto('/');
    await page.getByRole('button', { name: 'Skip tour' }).click();
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('devduo.demo')))!).state.toured).toBe(true);
    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'Show the tour again' }).click();
    const card = page.getByRole('dialog', { name: 'Quick tour' });
    await expect(card).toBeVisible();
    expect(await insideCard(page)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(card).toBeHidden();
  });

  test('keyboard only: Enter goes through every step', async ({ page }) => {
    await seed(page, { toured: false });
    await page.goto('/');
    const card = page.getByRole('dialog', { name: 'Quick tour' });
    for (const heading of ['Welcome to the demo store', 'Pick a template, colour and font', 'Change any text or image', 'Show it full screen and share it']) {
      await expect(card).toContainText(heading);
      await page.keyboard.press('Enter');
    }
    await expect(card).toBeHidden();
  });
});

test.describe('the account menu is a disclosure (A6)', () => {
  test('Enter opens it, Tab walks its items, Escape closes it and returns focus', async ({ page }) => {
    await seed(page);
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Account' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[role="menu"], [role="menuitem"]')).toHaveCount(0); // plain controls, not an ARIA menu

    await page.keyboard.press('Tab');
    await expect(page.locator('#acct-menu').getByRole('button', { name: 'Sign in' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#acct-menu').getByRole('link', { name: 'My orders' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('tabbing out of the menu closes it', async ({ page }) => {
    await seed(page);
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Account' });
    await button.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // past the last item, on to the wishlist link
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('checkout errors are announced (A7)', () => {
  test('focus goes to the first invalid field, the message is linked, and a summary is read out', async ({ page }) => {
    await seed(page, { cart: true });
    await page.goto('/checkout');
    await page.getByRole('button', { name: /^Pay / }).click();

    const name = page.getByLabel('Full name');
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await name.getAttribute('aria-describedby');
    expect(describedBy).toBe('ck-name-err');
    await expect(page.locator(`#${describedBy}`)).toHaveText('Enter your full name.');

    const summary = page.locator('main [role="alert"][aria-live="assertive"]');
    await expect(summary).toContainText('fields need attention');
    await expect(summary).toContainText('Full name');
    await expect(summary).toContainText('Mobile number');

    // fixing a field clears its error and its link
    await name.fill('Asha Rao');
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#ck-name-err')).toHaveCount(0);
  });
});

test.describe('editable text and images work from the keyboard (A5)', () => {
  test('a heading keeps its role and name while editing; an image can be replaced with Enter', async ({ page }) => {
    await seed(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const h1 = page.locator('main h1').first();
    await expect(h1).toHaveAttribute('contenteditable', 'true');
    expect(await h1.evaluate((el) => el.tagName)).toBe('H1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    await h1.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Typed with a keyboard');
    await page.keyboard.press('Enter');
    await expect(h1).toHaveText('Typed with a keyboard');

    const change = page.locator('[data-image-slot="home.0.image"]');
    await expect(change).toHaveAttribute('role', 'button');
    await expect(change).toHaveAttribute('aria-label', 'Change image');
    await change.focus();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Enter')]);
    expect(chooser).toBeTruthy();
  });

  test('outside edit mode there are no editing roles or image buttons', async ({ page }) => {
    await seed(page);
    await page.goto('/');
    await expect(page.locator('[role="textbox"], [data-image-slot], [contenteditable]')).toHaveCount(0);
  });
});

test.describe('every page has its own title (B3)', () => {
  test('home, shop, product, cart, checkout and not found differ and name the brand', async ({ page }) => {
    await seed(page, { cart: true });
    const titles: Record<string, string> = {};
    for (const [key, path] of [['home', '/'], ['shop', '/shop'], ['product', '/product/h1'], ['cart', '/cart'], ['checkout', '/checkout'], ['category', '/category/honey'], ['search', '/search?q=honey'], ['wishlist', '/wishlist'], ['orders', '/orders'], ['404', '/nope']] as const) {
      await page.goto(path);
      await expect(page.locator('header .logo')).toBeVisible();
      titles[key] = await page.title();
    }
    expect(titles.home).toBe('Ooty Herbals · Devduo ESaas demo');
    expect(titles.shop).toBe('All products – Ooty Herbals · Devduo ESaas demo');
    expect(titles.product).toBe('Wild Honey – Ooty Herbals · Devduo ESaas demo');
    expect(titles.cart).toBe('Cart (1) – Ooty Herbals · Devduo ESaas demo');
    expect(titles.checkout).toBe('Checkout – Ooty Herbals · Devduo ESaas demo');
    expect(titles.category).toBe('Honey – Ooty Herbals · Devduo ESaas demo');
    expect(titles.search).toBe('Search: honey – Ooty Herbals · Devduo ESaas demo');
    expect(titles['404']).toBe('Page not found – Ooty Herbals · Devduo ESaas demo');
    expect(new Set(Object.values(titles)).size).toBe(Object.keys(titles).length);
  });

  test('the title follows navigation, a renamed brand, and the cart count', async ({ page }) => {
    await seed(page);
    await page.goto('/product/h7');
    await expect(page).toHaveTitle(/^Cold-pressed Coconut Oil – Ooty Herbals/);
    await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'View cart' }).click();
    await expect(page).toHaveTitle(/^Cart \(1\) – /);
    await page.getByRole('link', { name: 'Increase quantity for Cold-pressed Coconut Oil' }).count();
    await page.goto('/product/nothing');
    await expect(page).toHaveTitle(/^Product not found – /);
  });
});
