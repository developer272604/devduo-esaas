import { expect, test, type Page } from '@playwright/test';

const TEMPLATES = ['herbal', 'gadgets', 'fashion', 'marketplace', 'wellness'] as const;
const CART_ITEM: Record<(typeof TEMPLATES)[number], string> = { herbal: 'h7', gadgets: 'g6', fashion: 'f11', marketplace: 'm9', wellness: 'w8' };
const PRODUCT: Record<(typeof TEMPLATES)[number], string> = { herbal: 'h3', gadgets: 'g6', fashion: 'f1', marketplace: 'm1', wellness: 'w1' };
const ROUTES = ['/', '/shop', '/category/honey', '/product/h3', '/cart', '/checkout', '/wishlist', '/orders', '/search?q=honey', '/search?q=zzzz', '/success/none', '/nope'];

/** Starts a page as a returning visitor with one item in the cart, on the given template. */
async function open(page: Page, path: string, tpl: (typeof TEMPLATES)[number] = 'herbal') {
  await page.addInitScript(
    ([tpl, item]) => {
      localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
      localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
      localStorage.setItem('devduo.cart', JSON.stringify({ state: { lines: [{ id: item, o: 0, qty: 1 }], coupon: null }, version: 0 }));
    },
    [tpl, CART_ITEM[tpl]] as const,
  );
  await page.goto(path);
  await expect(page.locator('header .logo')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of [320, 360, 390, 768]) {
  test.describe(`no sideways scroll at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ROUTES) {
      test(`herbal ${path}`, async ({ page }) => {
        await open(page, path);
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      });
    }
    for (const tpl of TEMPLATES) {
      test(`${tpl} home`, async ({ page }) => {
        await open(page, '/', tpl);
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      });
      test(`${tpl} product page`, async ({ page }) => {
        await open(page, `/product/${PRODUCT[tpl]}`, tpl);
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      });
    }
    test('a 5,000 character search does not stretch the page, and the box stops at 80 characters', async ({ page }) => {
      await open(page, `/search?q=${'A'.repeat(5000)}`);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      expect((await page.locator('.ph h1').innerText()).length).toBeLessThan(120);
      await page.locator('header .search input').fill('B'.repeat(200));
      expect(await page.locator('header .search input').inputValue()).toHaveLength(80);
    });
  });
}

test.describe('phone: demo tools and touch targets', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('one round button opens Edit, Full screen, Screenshot and Settings, each at least 44px', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('.stab')).toBeHidden();
    const fab = page.getByTestId('demo-fab');
    await expect(fab).toBeVisible();
    await expect(page.getByRole('button', { name: 'Screenshot' })).toBeHidden(); // menu starts closed
    await fab.tap();
    for (const name of ['Edit', 'Full screen', 'Screenshot', 'Settings']) {
      const b = page.getByRole('button', { name, exact: true });
      await expect(b).toBeVisible();
      const box = (await b.boundingBox())!;
      expect(box.height, name).toBeGreaterThanOrEqual(44);
      expect(box.width, name).toBeGreaterThanOrEqual(44);
      expect(box.x, name).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, name).toBeLessThanOrEqual(390);
    }
    // Escape closes the menu
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Screenshot' })).toBeHidden();
  });

  test('the menu buttons work: Edit, Settings, Full screen', async ({ page }) => {
    await open(page, '/');
    await page.getByTestId('demo-fab').tap();
    await page.getByRole('button', { name: 'Edit', exact: true }).tap();
    await expect(page.locator('main h1').first()).toHaveAttribute('contenteditable', 'true');
    await page.getByTestId('demo-fab').tap();
    await page.getByRole('button', { name: 'Settings', exact: true }).tap();
    await expect(page.getByRole('dialog', { name: 'Storefront settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Close settings' }).tap();
    await page.getByTestId('demo-fab').tap();
    await page.getByTestId('fullscreen').tap();
    await expect(page.locator('html')).toHaveClass(/is-preview/);
  });

  test('screenshot works from the phone menu', async ({ page }) => {
    await open(page, '/');
    await page.getByTestId('demo-fab').tap();
    await page.getByTestId('screenshot').tap();
    await expect(page.getByRole('dialog', { name: 'Screenshot ready' })).toBeVisible({ timeout: 45_000 });
  });

  /** At every scroll position where a primary button is on screen, the button (not the demo button) is what you tap. */
  async function neverCovered(page: Page, selector: string) {
    const failures = await page.evaluate(async (sel) => {
      const target = document.querySelector<HTMLElement>(sel);
      if (!target) return [`missing ${sel}`];
      const bad: string[] = [];
      const headerBottom = document.querySelector('header')!.getBoundingClientRect().bottom;
      const max = document.documentElement.scrollHeight - innerHeight;
      for (let y = 0; y <= max + 80; y += 80) {
        window.scrollTo(0, Math.min(y, max));
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Scrolled under the sticky header is normal; only the demo tools must never be what you hit.
        if (cy < headerBottom || cy > innerHeight || cx < 0 || cx > innerWidth) continue;
        const hit = document.elementFromPoint(cx, cy);
        if (!hit || !target.contains(hit)) bad.push(`scrollY ${Math.round(scrollY)}: ${hit?.tagName}.${String(hit?.className).slice(0, 30)}`);
      }
      return bad;
    }, selector);
    expect(failures).toEqual([]);
  }

  test('Add to cart, Proceed to checkout and Pay are never covered', async ({ page }) => {
    await open(page, '/product/h3');
    await neverCovered(page, '.buy .btn:not(.ghost)');
    await open(page, '/cart');
    await neverCovered(page, '.sum a.btn');
    await open(page, '/checkout');
    await neverCovered(page, '.sum .place');
  });

  test('the last thing on a page is not hidden behind the demo button', async ({ page }) => {
    await open(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const fab = (await page.getByTestId('demo-fab').boundingBox())!;
    const lastText = (await page.locator('footer .fb span').first().boundingBox())!;
    // the copyright line sits above the button, with room to spare
    expect(lastText.y + lastText.height).toBeLessThan(fab.y);
  });

  test('form fields are at least 16px so iOS does not zoom', async ({ page }) => {
    for (const path of ['/shop', '/checkout', '/cart']) {
      await open(page, path);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('input, select, textarea')]
          .filter((el) => el.offsetParent !== null && !['checkbox', 'radio', 'range', 'hidden', 'file', 'color'].includes((el as HTMLInputElement).type))
          .map((el) => ({ el: `${el.tagName}#${el.id || (el as HTMLInputElement).name || (el as HTMLInputElement).placeholder}`, size: parseFloat(getComputedStyle(el).fontSize) }))
          .filter((x) => x.size < 16),
      );
      expect(small, path).toEqual([]);
    }
    await open(page, '/', 'marketplace'); // newsletter
    const news = await page.locator('.news-form input[type=email]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(news).toBeGreaterThanOrEqual(16);
  });

  test('every tap target is at least 44 x 44', async ({ page }) => {
    for (const path of ['/', '/shop', '/product/h3', '/cart', '/checkout', '/orders', '/search?q=honey', '/nope']) {
      await open(page, path);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [role="button"]')) {
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if ((el as HTMLInputElement).type === 'hidden' || el.closest('.skip, [aria-hidden="true"]:not(a)')) continue;
          if (el.closest('p') && el.tagName === 'A') continue; // inline link inside a sentence
          const type = (el as HTMLInputElement).type;
          const box = (['checkbox', 'radio'].includes(type) ? el.closest('label') ?? el : el).getBoundingClientRect();
          if (box.width === 0 || box.height === 0) continue;
          if (box.width < 43.5 || box.height < 43.5) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${(el.textContent ?? '').trim().slice(0, 24)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
        return out;
      });
      expect(small, path).toEqual([]);
    }
  });
});
