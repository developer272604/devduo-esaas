import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const TEMPLATES = ['herbal', 'gadgets', 'fashion', 'marketplace', 'wellness'] as const;
const OTHER = (tpl: string) => TEMPLATES.filter((t) => t !== tpl);

async function start(page: Page, tpl: string) {
  await page.addInitScript((tpl) => {
    localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
    localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
  }, tpl);
}

const scripts = (urls: string[]) => urls.filter((u) => /\/assets\/[^/]+\.js(\?|$)/.test(u)).map((u) => u.split('/assets/')[1]);

test.describe('only what is needed is downloaded (P1, P2)', () => {
  for (const tpl of TEMPLATES) {
    test(`${tpl}: its catalogue loads, the other four do not, and neither does the screenshot library`, async ({ page }) => {
      const requested: string[] = [];
      page.on('request', (r) => requested.push(r.url()));
      await start(page, tpl);
      await page.goto('/');
      await expect(page.locator('header .logo')).toBeVisible();
      await page.waitForLoadState('networkidle');
      const js = scripts(requested);
      expect(js.some((f) => f.startsWith(`tpl-${tpl}-`)), `tpl-${tpl} chunk in ${js.join(', ')}`).toBe(true);
      for (const other of OTHER(tpl)) expect(js.some((f) => f.startsWith(`tpl-${other}-`)), `tpl-${other} should not be fetched`).toBe(false);
      expect(js.some((f) => f.startsWith('html-to-image-')), 'screenshot library should not be fetched yet').toBe(false);
    });
  }

  test('switching template fetches the new catalogue then, and only then', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await start(page, 'herbal');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(scripts(requested).some((f) => f.startsWith('tpl-gadgets-'))).toBe(false);

    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.locator('[data-template="gadgets"]').click();
    await expect(page.locator('header .logo')).toContainText('MobiStore');
    expect(scripts(requested).some((f) => f.startsWith('tpl-gadgets-'))).toBe(true);
    expect(scripts(requested).some((f) => f.startsWith('tpl-fashion-'))).toBe(false);
  });

  test('the screenshot library is fetched when Screenshot is pressed', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await start(page, 'herbal');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(scripts(requested).some((f) => f.startsWith('html-to-image-'))).toBe(false);
    await page.getByTestId('screenshot').click();
    await expect(page.getByRole('dialog', { name: 'Screenshot ready' })).toBeVisible({ timeout: 45_000 });
    expect(scripts(requested).some((f) => f.startsWith('html-to-image-'))).toBe(true);
  });

  test('a slow or failed template download leaves the current store working', async ({ page }) => {
    await start(page, 'herbal');
    await page.goto('/');
    await page.route(/tpl-gadgets-.*\.js/, (route) => route.abort());
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.locator('[data-template="gadgets"]').click();
    await expect(page.locator('#toast')).toContainText('Could not load that template');
    await expect(page.locator('header .logo')).toContainText('Ooty Herbals');
    await expect(page.locator('main h1').first()).toContainText('Natural honey');
  });
});

test.describe('the first picture (P4)', () => {
  test('the hero is preloaded with high priority and is not lazy', async ({ page }) => {
    await start(page, 'herbal');
    await page.goto('/');
    const href = await page.locator('head link[rel="preload"][as="image"]').getAttribute('href');
    expect(href).toMatch(/\.webp$/);
    const hero = page.locator('.hero-img img.hero-img-photo');
    await expect(hero).toHaveAttribute('src', href!);
    await expect(hero).toHaveAttribute('loading', 'eager');
    await expect(hero).toHaveAttribute('fetchpriority', 'high');
    expect(await page.locator('head link[rel="preload"][as="image"]').count()).toBe(1); // only the first one
  });

  test('pictures further down the page wait until they are near', async ({ page }) => {
    await start(page, 'herbal');
    await page.goto('/');
    const lazy = await page.locator('main img[loading="lazy"]').count();
    expect(lazy).toBeGreaterThan(8);
  });
});

for (const width of [390, 1440]) {
  test.describe(`layout does not jump while the page loads, at ${width}px (P4)`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const tpl of TEMPLATES) {
      test(`${tpl} home has a layout shift score under 0.05`, async ({ page }) => {
        await page.addInitScript(() => {
          (window as unknown as { __cls: number }).__cls = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
        });
        await start(page, tpl);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
        });
        await page.waitForTimeout(500);
        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThan(0.05);
      });
    }
  });
}

test.describe('what was built (P1, P2, P4)', () => {
  const assets = join('dist', 'assets');
  const files = () => (existsSync(assets) ? readdirSync(assets) : []);
  const size = (f: string) => statSync(join(assets, f)).size;

  test('every template and the screenshot library is its own file', () => {
    for (const name of ['tpl-herbal', 'tpl-gadgets', 'tpl-fashion', 'tpl-marketplace', 'tpl-wellness', 'html-to-image']) {
      expect(files().some((f) => f.startsWith(name + '-') && f.endsWith('.js')), name).toBe(true);
    }
  });

  test('no template catalogue is inside the file that loads first, and it stays within its size budget', () => {
    const main = files().filter((f) => /^index-.*\.js$/.test(f));
    expect(main).toHaveLength(1);
    const code = readFileSync(join(assets, main[0]), 'utf8');
    // a product name from each template: these live in that template's own chunk
    for (const name of ['Wild Honey', 'Aurora X1 Pro Max', 'Floral Printed Kurti Set', 'Aged Basmati Rice', 'DS-01 Daily Synbiotic']) {
      expect(code.includes(name), `"${name}" should not be in the main file`).toBe(false);
    }
    // a regression guard, not a target: the file was 308 KB when this was written (97 KB gzipped)
    expect(size(main[0]), `${Math.round(size(main[0]) / 1024)} KB`).toBeLessThan(330 * 1024);
  });

  test('photos are WebP and weigh at least 30% less than the original JPEGs (1,351 KB)', () => {
    const images = files().filter((f) => /\.(jpe?g|png|webp)$/.test(f));
    expect(images.filter((f) => /\.jpe?g$/.test(f))).toEqual([]);
    const total = images.reduce((a, f) => a + size(f), 0);
    expect(total, `${Math.round(total / 1024)} KB`).toBeLessThan(1351 * 1024 * 0.7);
  });
});
