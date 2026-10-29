import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const TEMPLATES = ['herbal', 'gadgets', 'fashion', 'marketplace', 'wellness'] as const;

async function open(page: Page, path: string, tpl: (typeof TEMPLATES)[number]) {
  await page.addInitScript((tpl) => {
    localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
    localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
  }, tpl);
  await page.goto(path);
  await expect(page.locator('header .logo')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

for (const width of [390, 1440]) {
  test.describe(`pictures at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const tpl of TEMPLATES) {
      for (const path of ['/', '/shop', '/category/' + { herbal: 'honey', gadgets: 'phones', fashion: 'kurtis', marketplace: 'home', wellness: 'gut' }[tpl]]) {
        test(`${tpl} ${path}: no emoji pictures, no broken or empty image boxes`, async ({ page }) => {
          await open(page, path, tpl);
          // scroll through so lazy images load
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 600) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 40));
            }
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(300);
          // images in sideways-scrolling rows are lazy: ask for all of them, then judge
          const broken = await page.evaluate(() =>
            Promise.all(
              [...document.querySelectorAll<HTMLImageElement>('main img')].map((img) => {
                img.loading = 'eager';
                return img.decode().then(() => '', () => `broken image ${img.getAttribute('src')?.slice(0, 50)}`);
              }),
            ).then((r) => r.filter(Boolean)),
          );
          expect(broken).toEqual([]);
          const report = await page.evaluate(() => {
            const problems: string[] = [];
            if (document.querySelectorAll('.art .em, .art .em.sm, .art .em.xl').length) problems.push('emoji picture on a product');
            for (const art of document.querySelectorAll<HTMLElement>('.art')) {
              const r = art.getBoundingClientRect();
              if (r.width < 20) continue;
              if (!art.querySelector('img, svg')) problems.push(`empty product picture ${art.getAttribute('aria-label') ?? ''}`);
            }
            for (const box of document.querySelectorAll<HTMLElement>('.ring, .soft-pic, .quick-pic, .tile-pic, .card-pic, .promo-pic, .testi-pic, .flash-pic, .feature-pic, .hero-deals-visual')) {
              const r = box.getBoundingClientRect();
              if (r.width < 20) continue;
              if (!box.querySelector('img, svg') && !(box.textContent ?? '').trim()) problems.push(`empty picture box .${box.className.split(' ')[0]}`);
            }
            return problems;
          });
          expect(report).toEqual([]);
        });
      }
    }
  });
}

test.describe('colour contrast (A2)', () => {
  for (const width of [390, 1440]) {
    test.describe(`${width}px`, () => {
      test.use({ viewport: { width, height: 900 } });
      for (const tpl of TEMPLATES) {
        test(`${tpl} home has no contrast failures`, async ({ page }) => {
          await open(page, '/', tpl);
          const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
          const bad = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary?.split('\n')[1]?.trim()}`));
          expect(bad).toEqual([]);
        });
      }
    });
  }

  test('every template and mode passes contrast on the product, cart and checkout pages too', async ({ page }) => {
    for (const tpl of TEMPLATES) {
      for (const mode of ['light', 'dark']) {
        await page.addInitScript(
          ([tpl, mode]) => {
            localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
            localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl }, version: 0 }));
            localStorage.setItem('devduo.theme', JSON.stringify({ state: { themes: { [tpl]: { primary: '#e8a317', font: 'Inter', mode, radius: 'soft' } } }, version: 0 }));
          },
          [tpl, mode] as const,
        );
        for (const path of ['/shop', '/cart']) {
          await page.goto(path);
          await expect(page.locator('header .logo')).toBeVisible();
          const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
          const bad = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}`));
          expect(bad, `${tpl} ${mode} ${path} with a yellow brand colour`).toEqual([]);
        }
      }
    }
  });
});

/** Average backdrop behind a block of text, measured with the text hidden, as contrast against white. */
async function contrastAgainstWhite(page: Page, area: Locator) {
  const box = (await area.boundingBox())!;
  await page.addStyleTag({ content: '.hero-img-copy *, .hero-photo h1 { color: transparent !important; text-shadow: none !important; border-color: transparent !important; background: transparent !important; } .hero-img-copy .btn, .chip-row li { opacity: 0 !important; }' });
  const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    // the lightest 5% of pixels: the worst case for white text
    const lums: number[] = [];
    for (let i = 0; i < d.length; i += 16) lums.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
    lums.sort((a, b) => b - a);
    const worst = lums[Math.floor(lums.length * 0.05)];
    return 1.05 / (worst + 0.05);
  }, png.toString('base64'));
}

test.describe('hero text stays readable on any uploaded photo (U7)', () => {
  const whitePhoto = async (page: Page) =>
    page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 36;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 36);
      return c.toDataURL('image/png');
    });

  for (const width of [390, 1440]) {
    test(`herbal hero copy over a pure white photo at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, '/', 'herbal');
      const url = await whitePhoto(page);
      await page.evaluate((url) => localStorage.setItem('devduo.custom', JSON.stringify({ state: { texts: {}, images: { herbal: { 'home.0.image': url } } }, version: 0 })), url);
      await page.reload();
      await expect(page.locator('.hero-img img.hero-img-photo')).toHaveAttribute('src', /^data:image\/png/);
      const ratio = await contrastAgainstWhite(page, page.locator('.hero-img-copy'));
      expect(ratio, `white text over the lightest part of the backdrop: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  test('photo hero title (large text) over a pure white photo', async ({ page }) => {
    await open(page, '/', 'wellness');
    const url = await whitePhoto(page);
    await page.evaluate((url) => localStorage.setItem('devduo.custom', JSON.stringify({ state: { texts: {}, images: { wellness: { 'home.0.image': url } } }, version: 0 })), url);
    await page.reload();
    await expect(page.locator('.hero-photo img')).toHaveAttribute('src', /^data:image\/png/);
    const ratio = await contrastAgainstWhite(page, page.locator('.hero-photo h1'));
    expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
  });
});
