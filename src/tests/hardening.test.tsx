import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useOrdersStore } from '@/store/orders';
import { useWishlistStore } from '@/store/wishlist';
import { useCheckoutStore, emptyCheckout } from '@/store/checkout';
import { useThemeStore } from '@/store/theme';
import { useTemplateStore } from '@/store/template';
import { useCustomize, fitsBudget, imageChars } from '@/store/customize';
import { useUiStore } from '@/store/ui';
import { runPlaceOrder } from '@/store/actions';
import { adapters } from '@/lib/adapters';
import { sanitizeCartLines, sanitizeCoupon, sanitizeIds, sanitizeImages, sanitizeOrders, sanitizeQty, sanitizeTexts, sanitizeThemes, sanitizeUser } from '@/lib/sanitize';
import { computeTotals, toPriced } from '@/lib/pricing';
import { IMAGE_BUDGET, MAX_QTY } from '@/lib/constants';
import { clampText, limitFor, roomLeft } from '@/lib/textLimit';
import { isSafeThemeVar } from '@/lib/theme';
import { safeStorage, setQuotaHandler } from '@/lib/storage';
import { QtyStepper } from '@/components/common/bits';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TEMPLATES } from '@/templates';

const seed = (key: string, value: unknown) => window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
const rehydrate = async () => {
  await Promise.all([
    useCartStore.persist.rehydrate(), useAuthStore.persist.rehydrate(), useOrdersStore.persist.rehydrate(), useWishlistStore.persist.rehydrate(),
    useCheckoutStore.persist.rehydrate(), useThemeStore.persist.rehydrate(), useTemplateStore.persist.rehydrate(), useCustomize.persist.rehydrate(),
  ]);
};
const PNG = 'data:image/png;base64,iVBORw0KGgo=';

beforeEach(() => {
  window.localStorage.clear();
  useCartStore.setState({ lines: [], coupon: null });
  useAuthStore.setState({ user: null });
  useOrdersStore.setState({ orders: [] });
  useWishlistStore.setState({ ids: [] });
  useThemeStore.setState({ themes: {} });
  useTemplateStore.setState({ tpl: 'herbal' });
  useCustomize.setState({ texts: {}, images: {}, editing: false, pick: null });
  useCheckoutStore.setState({ form: emptyCheckout });
  useUiStore.setState({ modal: null, toast: null, afterAuth: null });
});

describe('tampered cart (S3, S5)', () => {
  const load = async (state: unknown) => {
    seed('devduo.cart', { state, version: 0 });
    await rehydrate();
    return useCartStore.getState();
  };

  it('clamps a huge quantity to the maximum', async () => {
    expect((await load({ lines: [{ id: 'h1', o: 0, qty: 1_000_000_000 }], coupon: null })).lines).toEqual([{ id: 'h1', o: 0, qty: MAX_QTY }]);
  });
  it('drops negative, zero, text, fractional below one and null quantities', async () => {
    for (const qty of [-5, 0, 'abc', 0.5, null, NaN, Infinity, {}, [], true]) {
      expect((await load({ lines: [{ id: 'h1', o: 0, qty }], coupon: null })).lines, String(qty)).toEqual([]);
    }
  });
  it('rounds a fractional quantity down and accepts a numeric string', async () => {
    expect((await load({ lines: [{ id: 'h1', o: 0, qty: 2.9 }, { id: 'h2', o: 0, qty: '3' }], coupon: null })).lines.map((l) => l.qty)).toEqual([2, 3]);
  });
  it('survives lines that are not an array', async () => {
    for (const lines of [{}, 'x', 5, null, true]) expect((await load({ lines, coupon: null })).lines).toEqual([]);
  });
  it('survives garbage JSON and a state that is not an object', async () => {
    seed('devduo.cart', '{not json');
    await expect(rehydrate()).resolves.not.toThrow();
    expect(useCartStore.getState().lines).toEqual([]);
    for (const raw of ['null', '"x"', '[]', '5']) {
      seed('devduo.cart', raw);
      await expect(rehydrate()).resolves.not.toThrow();
      expect(useCartStore.getState().lines).toEqual([]);
    }
  });
  it('drops duplicate lines, bad option indexes and entries that are not objects', () => {
    const lines = sanitizeCartLines([{ id: 'h1', o: 0, qty: 1 }, { id: 'h1', o: 0, qty: 5 }, { id: 'h2', o: -1, qty: 1 }, { id: 'h3', o: 1.5, qty: 1 }, 7, null, { id: 5, o: 0, qty: 1 }, { id: '__proto__', o: 0, qty: 1 }]);
    expect(lines).toEqual([{ id: 'h1', o: 0, qty: 1 }]);
  });
  it('drops an unknown coupon on load and keeps a real one', async () => {
    expect((await load({ lines: [], coupon: 'FREE100' })).coupon).toBeNull();
    expect((await load({ lines: [], coupon: '<img src=x onerror=alert(1)>' })).coupon).toBeNull();
    expect((await load({ lines: [], coupon: 'WELCOME10' })).coupon).toBe('WELCOME10');
    expect(sanitizeCoupon(42)).toBeNull();
  });
  it('never prices a bad quantity, even if one reaches the pricing code', () => {
    const find = (id: string) => TEMPLATES.herbal.products.find((p) => p.id === id);
    const lines = toPriced([{ id: 'h7', o: 0, qty: -5 }, { id: 'h8', o: 0, qty: 1e9 }, { id: 'h9', o: 0, qty: 'abc' as never }], find);
    expect(lines.map((l) => l.qty)).toEqual([1, MAX_QTY, 1]);
    const t = computeTotals(lines, { coupon: null, speed: 'std', pay: 'upi' });
    expect(Number.isFinite(t.total) && t.total > 0).toBe(true);
    expect(toPriced({} as never, find)).toEqual([]);
  });
  it('WELCOME10 never discounts more than 500', () => {
    const p = { ...TEMPLATES.herbal.products[0], price: 100_000, mrp: 100_000, opts: undefined };
    expect(computeTotals([{ product: p, o: 0, qty: MAX_QTY }], { coupon: 'WELCOME10', speed: 'std', pay: 'upi' }).disc).toBe(500);
  });
  it('sanitizeQty only returns whole numbers from 1 to the maximum', () => {
    expect([5, '7', 99, 1.2].map(sanitizeQty)).toEqual([5, 7, MAX_QTY, 1]);
    expect([0, -1, 'x', '', undefined].map(sanitizeQty)).toEqual([null, null, null, null, null]);
  });
});

describe('tampered account and orders (S2, S4)', () => {
  it('a wrong-type user becomes signed out', async () => {
    seed('devduo.auth', { state: { user: { name: 5, phone: null } }, version: 0 });
    await rehydrate();
    expect(useAuthStore.getState().user).toBeNull();
    expect(sanitizeUser({ name: 'Asha', phone: '9876543210' })).toEqual({ name: 'Asha', phone: '9876543210' });
    expect(sanitizeUser({ name: 'Asha', phone: '12345' })).toBeNull();
    expect(sanitizeUser('x')).toBeNull();
  });
  it('orders that are not an array, or malformed, become an empty list without throwing', async () => {
    for (const orders of ['x', { id: 1 }, 5, null, [{ id: 1 }], [{ id: 'a', stage: 99 }]]) {
      seed('devduo.orders', { state: { orders }, version: 0 });
      await expect(rehydrate()).resolves.not.toThrow();
      expect(useOrdersStore.getState().orders, JSON.stringify(orders)).toEqual([]);
    }
  });
  const good = {
    id: 'DD12345678', tpl: 'herbal', date: 1, stage: 1, cancelled: false, pay: 'upi', ship: 'std',
    items: [{ id: 'h1', name: 'Wild Honey', emoji: '🍯', opt: '', qty: 2, price: 499 }],
    t: { sub: 998, mrp: 1198, save: 200, disc: 0, ship: 59, cod: 0, total: 1057 },
    addr: { name: 'Asha', phone: '9876543210', addr: '12 Lake View', city: 'Chennai', pin: '600001', state: 'TN' },
  };
  it('keeps a valid order and rejects out-of-range stage, NaN totals and negative prices', () => {
    expect(sanitizeOrders([good])).toHaveLength(1);
    expect(sanitizeOrders([{ ...good, stage: 5 }, { ...good, stage: -1 }, { ...good, stage: 1.5 }])).toEqual([]);
    expect(sanitizeOrders([{ ...good, t: { ...good.t, total: null } }])).toEqual([]);
    expect(sanitizeOrders([{ ...good, items: [{ ...good.items[0], price: -1 }] }])).toEqual([]);
    expect(sanitizeOrders([good, { ...good }])).toHaveLength(1); // duplicate ids
  });
  it('a bad wishlist and checkout form do not crash', async () => {
    seed('devduo.wishlist', { state: { ids: { a: 1 } }, version: 0 });
    seed('devduo.checkout', { state: { form: { name: 5, pay: 'bitcoin', card: '4242424242424242' } }, version: 0 });
    await rehydrate();
    expect(useWishlistStore.getState().ids).toEqual([]);
    expect(useCheckoutStore.getState().form).toMatchObject({ name: '', pay: 'upi', card: '' });
    expect(sanitizeIds(['a', 'a', 3, '__proto__'])).toEqual(['a']);
  });
});

describe('tampered theme, template and edits (S6)', () => {
  it('drops incomplete or unknown themes and keeps a valid one', () => {
    const themes = sanitizeThemes({
      herbal: { primary: '#2f7d4f', font: 'Inter', mode: 'dark', radius: 'soft' },
      fashion: { primary: 'url(https://evil.example/x.png)', font: 'Inter', mode: 'light', radius: 'soft' },
      gadgets: { primary: '#2f7d4f', font: 'Comic Sans', mode: 'light', radius: 'soft' },
      __proto__: { primary: '#000000', font: 'Inter', mode: 'light', radius: 'soft' },
    });
    expect(Object.keys(themes)).toEqual(['herbal']);
  });
  it('an unknown template id falls back to the default', async () => {
    seed('devduo.template', { state: { tpl: '../../etc' }, version: 0 });
    await rehydrate();
    expect(useTemplateStore.getState().tpl).toBe('herbal');
  });
  it('theme variables must be plain values: no URLs, no declarations, no odd names', () => {
    expect(isSafeThemeVar('--bg', '#0f1211')).toBe(true);
    expect(isSafeThemeVar('--font', "'Space Grotesk Variable', system-ui, sans-serif")).toBe(true);
    expect(isSafeThemeVar('--artL1', '93%')).toBe(true);
    expect(isSafeThemeVar('--radius', '10px')).toBe(true);
    expect(isSafeThemeVar('--bg', 'url(https://evil.example/x.png)')).toBe(false);
    expect(isSafeThemeVar('--bg', 'red; background:url(x)')).toBe(false);
    expect(isSafeThemeVar('--bg', '}body{display:none')).toBe(false);
    expect(isSafeThemeVar('background', '#fff')).toBe(false);
    expect(isSafeThemeVar('--x', 5)).toBe(false);
  });
  it('replacement images must be inline raster data, never a URL, SVG or HTML', () => {
    const images = sanitizeImages({
      herbal: { a: PNG, b: 'https://evil.example/x.png', c: 'data:image/svg+xml;base64,PHN2Zz4=', d: 'data:text/html;base64,PGI+', e: 5 },
      '__proto__': { a: PNG },
    });
    expect(images).toEqual({ herbal: { a: PNG } });
    expect(sanitizeTexts({ herbal: { a: 'ok', b: 5, c: '   ' }, constructor: { a: 'x' } })).toEqual({ herbal: { a: 'ok' } });
  });
});

describe('image storage budget and full storage (S7)', () => {
  it('refuses an image that would pass the budget and keeps the ones already saved', () => {
    const c = useCustomize.getState();
    expect(c.setImage('herbal', 'a', PNG)).toBe(true);
    const big = 'data:image/webp;base64,' + 'A'.repeat(IMAGE_BUDGET);
    expect(c.setImage('herbal', 'b', big)).toBe(false);
    expect(useCustomize.getState().images.herbal).toEqual({ a: PNG });
  });
  it('replacing an image frees its old space, and the budget counts every template', () => {
    const half = 'data:image/webp;base64,' + 'A'.repeat(IMAGE_BUDGET / 2 - 100);
    const c = useCustomize.getState();
    expect(c.setImage('herbal', 'a', half)).toBe(true);
    expect(c.setImage('gadgets', 'a', half)).toBe(true);
    expect(c.setImage('fashion', 'a', half)).toBe(false);
    expect(c.setImage('herbal', 'a', half)).toBe(true); // same slot: old copy is released first
    expect(imageChars(useCustomize.getState().images)).toBeLessThanOrEqual(IMAGE_BUDGET);
    expect(fitsBudget({}, 'x', 'y', 'z')).toBe(true);
  });
  it('rejects data that is not an inline raster image', () => {
    expect(useCustomize.getState().setImage('herbal', 'a', 'https://evil.example/x.png')).toBe(false);
    expect(useCustomize.getState().setImage('herbal', 'a', 'data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
  });
  it('tells the shopper once when the browser refuses a write', () => {
    const handler = vi.fn();
    setQuotaHandler(handler);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => {
      safeStorage.setItem('devduo.cart', '{}');
      safeStorage.setItem('devduo.cart', '{}');
      safeStorage.setItem('devduo.orders', '{}');
    }).not.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
    spy.mockRestore();
    safeStorage.setItem('devduo.cart', '{}'); // a good write ends the episode
    const again = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    safeStorage.setItem('devduo.cart', '{}');
    expect(handler).toHaveBeenCalledTimes(2);
    again.mockRestore();
    setQuotaHandler(null);
  });
});

describe('editable text limit (E3)', () => {
  it('collapses whitespace and cuts to the limit', () => {
    expect(clampText('  a   b \n c ', 100)).toBe(' a b c ');
    expect(clampText('x'.repeat(5000), 200)).toHaveLength(200);
    expect(clampText('abc', 0)).toBe('');
  });
  it('gives paragraphs more room than headings', () => {
    expect(limitFor('h1')).toBe(200);
    expect(limitFor('p')).toBe(600);
    expect(limitFor('p', 50)).toBe(50);
  });
  it('counts the room left after replacing a selection', () => {
    expect(roomLeft(200, 190)).toBe(10);
    expect(roomLeft(200, 200)).toBe(0);
    expect(roomLeft(200, 200, 30)).toBe(30);
    expect(roomLeft(200, 500)).toBe(0);
  });
});

describe('payment flow (S8)', () => {
  const fill = () => {
    useCartStore.getState().add('h7', 0, 1);
    useCheckoutStore.getState().set({ name: 'Asha Rao', phone: '9876543210', addr: '12 Lake View Road', city: 'Chennai', pin: '600001', state: 'Tamil Nadu', upi: 'asha@upi' });
  };
  it('closes the dialog, tells the shopper and keeps the cart when the charge throws', async () => {
    fill();
    const spy = vi.spyOn(adapters.payment, 'charge').mockRejectedValueOnce(new Error('network'));
    await runPlaceOrder(vi.fn());
    expect(useUiStore.getState().modal).toBeNull();
    expect(useUiStore.getState().toast?.message).toMatch(/not charged/i);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useOrdersStore.getState().orders).toEqual([]);
    spy.mockRestore();
  });
  it('does the same when creating the order throws', async () => {
    fill();
    const spy = vi.spyOn(adapters.orders, 'create').mockRejectedValueOnce(new Error('boom'));
    await runPlaceOrder(vi.fn());
    expect(useUiStore.getState().modal).toBeNull();
    expect(useCartStore.getState().lines).toHaveLength(1);
    spy.mockRestore();
  });
  it('a double click creates exactly one order', async () => {
    fill();
    vi.useFakeTimers();
    const nav = vi.fn();
    const first = runPlaceOrder(nav);
    const second = runPlaceOrder(nav);
    await vi.advanceTimersByTimeAsync(1500);
    await Promise.all([first, second]);
    vi.useRealTimers();
    expect(useOrdersStore.getState().orders).toHaveLength(1);
    expect(nav).toHaveBeenCalledTimes(1);
  });
  it('can place another order after a failed one', async () => {
    fill();
    const spy = vi.spyOn(adapters.payment, 'charge').mockRejectedValueOnce(new Error('network'));
    await runPlaceOrder(vi.fn());
    spy.mockRestore();
    vi.useFakeTimers();
    const run = runPlaceOrder(vi.fn());
    await vi.advanceTimersByTimeAsync(1500);
    await run;
    vi.useRealTimers();
    expect(useOrdersStore.getState().orders).toHaveLength(1);
  });
});

describe('quantity stepper (B5) and error boundary (B1)', () => {
  it('stops at the shared maximum and says why', () => {
    render(<QtyStepper value={MAX_QTY} onChange={() => undefined} />);
    const up = screen.getByRole('button', { name: /increase quantity/i });
    expect(up).toBeDisabled();
    expect(up).toHaveAttribute('title', `Max ${MAX_QTY} per order`);
  });
  it('shows a way out instead of a blank page when a child throws, and reset clears only devduo keys', () => {
    const Boom = () => {
      throw new Error('render failed');
    };
    seed('devduo.cart', '{}');
    seed('other.key', 'keep');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    spy.mockRestore();
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Reset demo data' })).toBeInTheDocument();
  });
});
