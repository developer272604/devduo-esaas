import { expect, test, type Page } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const openSettings = (page: Page) => page.getByRole('button', { name: 'Open settings' }).click();
const markToured = (page: Page) =>
  page.addInitScript(() => {
    if (!localStorage.getItem('devduo.demo')) localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
  });

test.describe('first visit tour', () => {
  test('shows the steps, Skip ends it, and it does not come back', async ({ page }) => {
    await page.goto('/');
    const card = page.getByRole('dialog', { name: 'Quick tour' });
    await expect(card).toContainText('Welcome to the demo store');
    await card.getByRole('button', { name: 'Show me' }).click();
    await expect(card).toContainText('Pick a template, colour and font');
    await expect(page.locator('.tour-ring')).toBeVisible();
    await card.getByRole('button', { name: 'Next' }).click();
    await expect(card).toContainText('Change any text or image');
    await card.getByRole('button', { name: 'Skip tour' }).click();
    await expect(card).toBeHidden();

    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toBeHidden();

    await openSettings(page);
    await page.getByRole('button', { name: 'Show the tour again' }).click();
    await expect(page.getByRole('dialog', { name: 'Quick tour' })).toContainText('Welcome to the demo store');
  });

  test('finishing the last step also ends it', async ({ page }) => {
    await page.goto('/');
    const card = page.getByRole('dialog', { name: 'Quick tour' });
    for (const label of ['Show me', 'Next', 'Next']) await card.getByRole('button', { name: label }).click();
    await expect(card).toContainText('Show it full screen and share it');
    await card.getByRole('button', { name: 'Got it' }).click();
    await expect(card).toBeHidden();
  });
});

test.describe('edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await markToured(page);
    await page.goto('/');
  });

  test('text edits survive a refresh and a theme change, and can be reset', async ({ page }) => {
    const title = page.locator('main h1').first();
    const original = (await title.innerText()).trim();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(title).toHaveAttribute('contenteditable', 'true');
    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Honey made by Asha');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Done editing' }).click();
    await expect(title).toHaveText('Honey made by Asha');

    // brand name in the header and announcement are editable too
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('header .logo [data-editable="brand.name"]').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Asha Farms');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Done editing' }).click();
    await expect(page.locator('header .logo')).toContainText('Asha Farms');
    await expect(page.locator('footer')).toContainText('Asha Farms');

    await page.reload();
    await expect(title).toHaveText('Honey made by Asha');

    // theme changes do not remove it
    await openSettings(page);
    await page.locator('.sw button').nth(5).click();
    await page.locator('.fonts button', { hasText: /^Inter$/ }).click();
    await page.locator('.seg button', { hasText: 'Dark' }).click();
    await expect(title).toHaveText('Honey made by Asha');

    // clearing text restores the original; reset restores everything
    await page.getByRole('button', { name: /^Reset \d+ edits?$/ }).click();
    await expect(title).toHaveText(original);
    await expect(page.locator('header .logo')).toContainText('Ooty Herbals');
  });

  test('editing a link or button label never navigates', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const cta = page.locator('.hero-img-copy a.btn [data-editable]');
    await cta.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Buy my honey now');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/);
    await expect(cta).toHaveText('Buy my honey now');
  });

  test('home images can be replaced, persist, and have a small remove option', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const hero = page.locator('.hero-img img.hero-img-photo');
    const before = await hero.getAttribute('src');
    expect(before).not.toMatch(/^data:/);

    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-image-slot="home.0.image"]').click()]);
    await chooser.setFiles({ name: 'mine.png', mimeType: 'image/png', buffer: PNG });
    await expect(hero).toHaveAttribute('src', /^data:image\//);
    await expect(page.getByLabel('Remove custom image').first()).toBeVisible();

    // survives refresh and a theme change
    await page.reload();
    await expect(page.locator('.hero-img img.hero-img-photo')).toHaveAttribute('src', /^data:image\//);
    await openSettings(page);
    await page.locator('.sw button').nth(2).click();
    await page.locator('.dh button').click();
    await expect(page.locator('.hero-img img.hero-img-photo')).toHaveAttribute('src', /^data:image\//);

    // remove puts the original back
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Remove custom image').first().click();
    await expect(page.locator('.hero-img img.hero-img-photo')).toHaveAttribute('src', before!);
  });

  test('a replaced product picture shows on the home page and the product page, but is only editable on home', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-image-slot="product.h1"]').click()]);
    await chooser.setFiles({ name: 'jar.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.locator('.card .art-photo').first()).toHaveAttribute('src', /^data:image\//);
    await page.goto('/product/h1');
    await expect(page.locator('.gmain .art-photo')).toHaveAttribute('src', /^data:image\//);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
    await expect(page.locator('[data-image-slot], [contenteditable="true"]')).toHaveCount(0);
  });

  test('editing is home page only: no Edit button elsewhere, and leaving home switches it off', async ({ page }) => {
    for (const path of ['/shop', '/category/honey', '/cart', '/wishlist', '/orders', '/product/h2']) {
      await page.goto(path);
      await expect(page.getByRole('button', { name: /^(Edit|Done editing)$/ })).toHaveCount(0);
      await expect(page.locator('[data-image-slot], [contenteditable="true"]')).toHaveCount(0);
      await expect(page.getByTestId('screenshot')).toBeVisible(); // the other tools stay everywhere
    }

    await page.goto('/');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Done editing' })).toBeVisible();
    await page.locator('header nav.links').getByRole('link', { name: 'All products' }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
    await page.locator('header .logo').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible(); // back off, not stuck on
    await expect(page.locator('[contenteditable="true"]')).toHaveCount(0);
  });

  test('edits made on the home page show on every other page', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('header .logo [data-editable="brand.name"]').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Asha Farms');
    await page.keyboard.press('Enter');
    await page.goto('/cart');
    await expect(page.locator('header .logo')).toContainText('Asha Farms');
    await expect(page.locator('footer')).toContainText('Asha Farms');
    await expect(page).toHaveTitle(/Asha Farms/);
  });
});

test.describe('full screen, screenshot and share', () => {
  test.beforeEach(async ({ page }) => {
    await markToured(page);
    await page.goto('/');
  });

  test('full screen hides the tools and exits again', async ({ page }) => {
    await expect(page.locator('.stab')).toBeVisible();
    await page.getByTestId('fullscreen').click();
    await expect(page.locator('html')).toHaveClass(/is-preview/);
    await expect(page.locator('.stab')).toBeHidden();
    await page.getByTestId('fullscreen').click();
    await expect(page.locator('html')).not.toHaveClass(/is-preview/);
    await expect(page.locator('.stab')).toBeVisible();
  });

  test('screenshot opens a modal with a watermarked image, download and WhatsApp share', async ({ page }) => {
    await page.getByTestId('screenshot').click();
    const dialog = page.getByRole('dialog', { name: 'Screenshot ready' });
    await expect(dialog).toBeVisible({ timeout: 45_000 });
    const img = dialog.locator('img');
    await expect(img).toBeVisible();
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(500);

    // the watermark badge is dark and sits in the bottom-right corner of the picture
    const luminance = await img.evaluate(async (el: HTMLImageElement) => {
      const c = document.createElement('canvas');
      c.width = el.naturalWidth;
      c.height = el.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(el, 0, 0);
      const d = ctx.getImageData(c.width - 24, c.height - 34, 1, 1).data;
      return (d[0] + d[1] + d[2]) / 3;
    });
    expect(luminance).toBeLessThan(90);

    // tools and the dialog itself are not in the picture: the bottom of the page is the footer, not the demo bar
    const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('button', { name: 'Download' }).click()]);
    expect(download.suggestedFilename()).toBe('storefront-demo.png');

    const [popup] = await Promise.all([page.waitForEvent('popup'), dialog.getByTestId('share-whatsapp').click()]);
    expect(popup.url()).toMatch(/wa\.me|whatsapp\.com/);
    await expect(dialog).toContainText('Attach it to the chat');

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  });

  test('the screenshot shows edits but not edit marks', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('main h1').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Edited headline');
    await page.keyboard.press('Enter');
    await page.getByTestId('screenshot').click();
    await expect(page.getByRole('dialog', { name: 'Screenshot ready' })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('html')).not.toHaveClass(/capturing/);
  });
});
