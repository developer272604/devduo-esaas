import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/** Reads public/_headers (Cloudflare Pages format) into { pattern: { header: value } }. */
function parseHeaders(file = 'public/_headers'): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  let current = '';
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!raw.trim()) continue;
    if (!/^\s/.test(raw)) {
      current = raw.trim();
      out[current] = {};
    } else {
      const i = raw.indexOf(':');
      out[current][raw.slice(0, i).trim()] = raw.slice(i + 1).trim();
    }
  }
  return out;
}

const HEADERS = parseHeaders();

test.describe('public/_headers (S9, P3)', () => {
  const all = HEADERS['/*'];
  const csp = all['Content-Security-Policy'];

  test('sets the protections the audit asked for', () => {
    expect(all['X-Frame-Options']).toBe('DENY');
    expect(all['X-Content-Type-Options']).toBe('nosniff');
    expect(all['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(all['Permissions-Policy']).toMatch(/camera=\(\)/);
    expect(all['Permissions-Policy']).toMatch(/microphone=\(\)/);
    expect(all['Permissions-Policy']).toMatch(/geolocation=\(\)/);
  });

  test('the policy is strict: own origin only, no inline script, no framing, no plugins', () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toMatch(/https?:\/\//); // nothing outside the site is allowed
  });

  test('hashed assets are cached for a year', () => {
    expect(HEADERS['/assets/*']['Cache-Control']).toBe('public, max-age=31536000, immutable');
  });
});

/** Serves the whole site with the headers from public/_headers, the way Cloudflare Pages would. */
async function withHeaders(page: Page) {
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    const url = new URL(route.request().url());
    const headers = { ...response.headers(), ...HEADERS['/*'] };
    if (url.pathname.startsWith('/assets/')) Object.assign(headers, HEADERS['/assets/*']);
    await route.fulfill({ response, headers });
  });
  const violations: string[] = [];
  await page.exposeFunction('reportViolation', (v: string) => violations.push(v));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => (window as unknown as { reportViolation: (v: string) => void }).reportViolation(`${e.violatedDirective} blocked ${e.blockedURI}`));
    localStorage.setItem('devduo.demo', JSON.stringify({ state: { toured: true }, version: 0 }));
  });
  page.on('console', (m) => /Content Security Policy|Refused to/i.test(m.text()) && violations.push(m.text()));
  page.on('pageerror', (e) => violations.push(`pageerror: ${e.message}`));
  return violations;
}

test.describe('the site works under its own policy (S9)', () => {
  test('the headers really are served with every response', async ({ page }) => {
    await withHeaders(page);
    const res = await page.goto('/');
    expect(res!.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(res!.headers()['x-frame-options']).toBe('DENY');
    expect(res!.headers()['permissions-policy']).toContain('camera=()');
  });

  test('browsing, editing, uploading, screenshot, sharing and checkout raise no policy violation', async ({ page }) => {
    const violations = await withHeaders(page);

    // browse, theme, template
    await page.goto('/');
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.locator('.sw button').nth(5).click();
    await page.locator('.fonts button', { hasText: /^Inter$/ }).click();
    await page.locator('input[type=color]').evaluate((el: HTMLInputElement) => {
      el.value = '#336699';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('[data-template="gadgets"]').click();
    await page.getByRole('button', { name: 'Close settings' }).click();
    await page.reload(); // the external theme script runs under the policy too
    await expect(page.locator('header .logo')).toContainText('MobiStore');

    // edit text and upload an image
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('main h1').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Under a strict policy');
    await page.keyboard.press('Enter');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-image-slot^="product."]').first().click()]);
    await chooser.setFiles({ name: 'a.png', mimeType: 'image/png', buffer: png });
    await expect(page.locator('.card .art-photo').first()).toHaveAttribute('src', /^data:image\//);
    await page.getByRole('button', { name: 'Done editing' }).click();

    // screenshot, download, share
    await page.getByTestId('screenshot').click();
    const dialog = page.getByRole('dialog', { name: 'Screenshot ready' });
    await expect(dialog).toBeVisible({ timeout: 45_000 });
    expect(await dialog.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(300);
    const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('button', { name: 'Download' }).click()]);
    expect(download.suggestedFilename()).toBe('devduo-esaas-demo.png');
    const [popup] = await Promise.all([page.waitForEvent('popup'), dialog.getByTestId('share-whatsapp').click()]);
    expect(popup.url()).toMatch(/wa\.me|whatsapp\.com/);
    await popup.close();
    await dialog.getByRole('button', { name: 'Close' }).click();

    // full screen
    await page.getByTestId('fullscreen').click();
    await expect(page.locator('html')).toHaveClass(/is-preview/);
    await page.getByTestId('fullscreen').click();

    // a purchase
    await page.goto('/product/g6');
    await page.locator('.buy').getByRole('button', { name: 'Add to cart' }).click();
    await page.goto('/checkout');
    await page.getByLabel('Full name').fill('Asha Rao');
    await page.getByLabel('Mobile number').fill('9876543210');
    await page.getByLabel('Address', { exact: true }).fill('12 Lake View Road');
    await page.getByLabel('City').fill('Chennai');
    await page.getByLabel('Pincode').fill('600001');
    await page.getByLabel('State').fill('Tamil Nadu');
    await page.getByLabel('Cash on delivery').check();
    await page.getByRole('button', { name: 'Place order' }).click();
    const auth = page.getByRole('dialog', { name: 'Sign in' });
    await auth.getByRole('button', { name: 'Send OTP' }).click();
    await auth.getByLabel('6-digit OTP').fill('123456');
    await auth.getByRole('button', { name: 'Verify and sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible({ timeout: 10_000 });

    expect(violations).toEqual([]);
  });

  test('a script from another site cannot run, and neither can inline script', async ({ page }) => {
    const violations = await withHeaders(page);
    await page.goto('/');
    const ran = await page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          (window as unknown as { __x: string }).__x = 'not run';
          const inline = document.createElement('script');
          inline.textContent = "window.__x = 'inline ran'";
          document.head.appendChild(inline);
          const external = document.createElement('script');
          external.src = 'https://example.com/x.js';
          external.onerror = () => resolve((window as unknown as { __x: string }).__x);
          external.onload = () => resolve('external ran');
          document.head.appendChild(external);
          setTimeout(() => resolve((window as unknown as { __x: string }).__x), 1500);
        }),
    );
    expect(ran).toBe('not run');
    expect(violations.some((v) => v.includes('script-src'))).toBe(true);
  });
});
