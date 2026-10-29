import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, tpl = 'herbal') {
  await page.addInitScript((tpl) => {
    localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
    localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
  }, tpl);
}

const edit = (page: Page) => page.getByRole('button', { name: /^(Edit|Done editing)$/ });
const editable = (page: Page) => page.locator('[contenteditable="true"]');
const turnOn = async (page: Page) => {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(edit(page)).toHaveAttribute('aria-pressed', 'true');
  expect(await editable(page).count()).toBeGreaterThan(5);
};

test.describe('edit mode is for the home page only (E1)', () => {
  test.beforeEach(async ({ page }) => start(page));

  test('Back and Forward never leave anything editable off the home page', async ({ page }) => {
    await page.goto('/shop');
    await page.getByRole('link', { name: 'Ooty Herbals home' }).click();
    await turnOn(page);

    await page.goBack(); // to /shop
    await expect(page).toHaveURL(/\/shop$/);
    await expect(editable(page)).toHaveCount(0);
    await expect(edit(page)).toHaveCount(0);

    await page.goForward(); // to home: switched off, does not resume by itself
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(editable(page)).toHaveCount(0);
  });

  test('opening a product and pressing Back does not resume editing', async ({ page }) => {
    await page.goto('/');
    await turnOn(page);
    // a client-side navigation, like following a link (a full reload would reset edit mode by itself)
    await page.evaluate(() => {
      history.pushState({}, '', '/product/h4');
      dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page).toHaveURL(/\/product\/h4$/);
    await expect(edit(page)).toHaveCount(0);
    await expect(editable(page)).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(editable(page)).toHaveCount(0);
  });

  test('a link taken in edit mode through the header leaves editing off', async ({ page }) => {
    await page.goto('/');
    await turnOn(page);
    await page.locator('header nav.links').getByRole('link', { name: 'All products' }).click();
    await expect(editable(page)).toHaveCount(0);
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  for (const path of ['/?x=1', '/#top', '/?utm_source=ad#hero']) {
    test(`${path} still counts as the home page`, async ({ page }) => {
      await page.goto(path);
      await turnOn(page);
      await expect(page.locator('main h1').first()).toHaveAttribute('contenteditable', 'true');
    });
  }

  test('switching template while editing keeps edit mode on the home page, and does not leak elsewhere', async ({ page }) => {
    await page.goto('/');
    await turnOn(page);
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.locator('[data-template="gadgets"]').click();
    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(page.locator('header .logo')).toContainText('MobiStore');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Done editing' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('main h1').first()).toHaveAttribute('contenteditable', 'true');

    await page.goto('/shop');
    await expect(editable(page)).toHaveCount(0);
    await expect(edit(page)).toHaveCount(0);
  });

  test('typing in edit mode never navigates, and switching off restores plain links', async ({ page }) => {
    await page.goto('/');
    await turnOn(page);
    const cta = page.locator('.hero-img-copy a.btn [data-editable]');
    await cta.click();
    await page.keyboard.type('x');
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('button', { name: 'Done editing' }).click();
    await expect(editable(page)).toHaveCount(0);
  });
});

test.describe('/index.html (E2)', () => {
  test('lands on the home page with the Edit button', async ({ page }) => {
    await start(page);
    await page.goto('/index.html');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
    await expect(page.locator('main h1').first()).toContainText('Natural honey');
  });
});

test.describe('pasting and typing are capped (E3)', () => {
  test('a 5,000 character paste leaves at most the limit and does not break the layout', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await start(page);
    await page.goto('/');
    await turnOn(page);
    const title = page.locator('main h1').first();
    await title.click();
    await page.keyboard.press('Control+A');
    await page.evaluate(() => navigator.clipboard.writeText('word '.repeat(1000)));
    await page.keyboard.press('Control+V');
    await page.keyboard.press('Enter'); // saves
    const length = (await title.innerText()).length;
    expect(length).toBeLessThanOrEqual(200);
    expect(length).toBeGreaterThan(50);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const stored = await page.evaluate(() => localStorage.getItem('devduo.custom') ?? '');
    expect(stored.length).toBeLessThan(2000);
  });

  test('typing stops at the limit', async ({ page }) => {
    await start(page);
    await page.goto('/');
    await turnOn(page);
    const title = page.locator('main h1').first();
    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('a'.repeat(260), { delay: 0 });
    await page.keyboard.press('Enter');
    expect((await title.innerText()).length).toBeLessThanOrEqual(200);
  });
});
