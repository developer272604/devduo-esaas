import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useTemplateStore } from '@/store/template';
import { useThemeStore } from '@/store/theme';
import { useUiStore } from '@/store/ui';
import { useOrdersStore } from '@/store/orders';
import { useAuthStore } from '@/store/auth';
import { emptyCheckout, useCheckoutStore } from '@/store/checkout';
import { placeOrder, switchTemplate } from '@/store/actions';
import { adapters, DEMO_OTP } from '@/lib/adapters';
import { TEMPLATES } from '@/templates';

beforeEach(() => {
  useCartStore.setState({ lines: [], coupon: null });
  useWishlistStore.setState({ ids: [] });
  useTemplateStore.setState({ tpl: 'herbal' });
  useThemeStore.setState({ themes: {} });
  useUiStore.setState({ modal: null, toast: null, afterAuth: null });
  useOrdersStore.setState({ orders: [] });
  useAuthStore.setState({ user: null });
  useCheckoutStore.setState({ form: emptyCheckout });
});

describe('cart store', () => {
  it('merges the same product and option and caps quantity at 10', () => {
    const c = useCartStore.getState();
    c.add('h1', 1, 4);
    c.add('h1', 1, 9);
    c.add('h1', 0, 1);
    expect(useCartStore.getState().lines).toEqual([
      { id: 'h1', o: 1, qty: 10 },
      { id: 'h1', o: 0, qty: 1 },
    ]);
  });
  it('updates by productId|optionIndex and removes at zero', () => {
    const c = useCartStore.getState();
    c.add('h1', 2, 2);
    c.setQty('h1|2', 5);
    expect(useCartStore.getState().lines[0].qty).toBe(5);
    c.setQty('h1|2', 0);
    expect(useCartStore.getState().lines).toEqual([]);
  });
});

describe('template switching', () => {
  const nav = vi.fn();
  beforeEach(() => nav.mockClear());

  it('switches straight away when cart and wishlist are empty', async () => {
    await switchTemplate('fashion', nav);
    expect(useTemplateStore.getState().tpl).toBe('fashion');
    expect(useUiStore.getState().modal).toBeNull();
    expect(nav).toHaveBeenCalledWith('/');
  });
  it('asks first, then clears cart, wishlist and coupon', async () => {
    useCartStore.getState().add('h1', 0, 1);
    useCartStore.getState().setCoupon('WELCOME10');
    useWishlistStore.getState().add('h2');
    await switchTemplate('gadgets', nav);
    const m = useUiStore.getState().modal;
    expect(m?.t).toBe('confirm');
    expect(m && m.t === 'confirm' && m.text).toContain('cart and wishlist will be cleared');
    expect(useTemplateStore.getState().tpl).toBe('herbal');
    if (m && m.t === 'confirm') await m.onYes();
    expect(useTemplateStore.getState().tpl).toBe('gadgets');
    expect(useCartStore.getState()).toMatchObject({ lines: [], coupon: null });
    expect(useWishlistStore.getState().ids).toEqual([]);
    expect(nav).toHaveBeenCalledWith('/');
  });
  it('remembers the look of each template', async () => {
    useThemeStore.getState().setTheme(TEMPLATES.herbal, { primary: '#be185d' });
    await switchTemplate('fashion', nav);
    expect(useThemeStore.getState().themes.fashion).toBeUndefined();
    expect(useThemeStore.getState().themes.herbal.primary).toBe('#be185d');
  });
  it('keeps orders from other templates', async () => {
    useOrdersStore.setState({ orders: [{ id: 'DD00000001', tpl: 'herbal' } as never] });
    await switchTemplate('fashion', nav);
    expect(useOrdersStore.getState().orders).toHaveLength(1);
  });
});

describe('catalogue', () => {
  it('has globally unique product ids across templates', () => {
    const ids = Object.values(TEMPLATES).flatMap((t) => t.products.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('returns nothing for a product id that belongs to another template', () => {
    expect(adapters.catalog.getProduct('fashion', 'h1')).toBeUndefined();
    expect(adapters.catalog.getProduct('herbal', 'h1')?.name).toBe('Wild Honey');
  });
  it('every template ships a full catalogue (herbal has 26, the others 10 to 12) and its references resolve', () => {
    for (const t of Object.values(TEMPLATES)) {
      expect(t.products.length, t.id).toBeGreaterThanOrEqual(10);
      expect(t.products.length, t.id).toBeLessThanOrEqual(t.id === 'herbal' ? 26 : 12);
      const ids = new Set(t.products.map((p) => p.id));
      const cats = new Set(t.cats.map((c) => c.slug));
      t.products.forEach((p) => expect(cats.has(p.cat), `${t.id}/${p.id} category`).toBe(true));
      t.home.forEach((s) => {
        if (s.type === 'featured') s.ids?.forEach((i) => expect(ids.has(i), `${t.id} featured ${i}`).toBe(true));
        if (s.type === 'flash') expect(ids.has(s.productId)).toBe(true);
        if (s.type === 'heroShowcase') expect(ids.has(s.spotlight.productId)).toBe(true);
      });
    }
  });
});

describe('adapters', () => {
  it('verifies only the demo OTP', async () => {
    expect((await adapters.auth.verifyOtp({ name: 'A', phone: '9876543210', otp: '000000' })).ok).toBe(false);
    expect((await adapters.auth.verifyOtp({ name: 'Asha', phone: '9876543210', otp: DEMO_OTP })).ok).toBe(true);
  });
  it('advances stages up to Delivered and cancels only before Shipped', () => {
    let o = { id: 'x', stage: 0, cancelled: false } as unknown as Parameters<typeof adapters.orders.advance>[0];
    for (let i = 0; i < 6; i++) o = adapters.orders.advance(o);
    expect(o.stage).toBe(4);
    expect(adapters.orders.cancel(o).cancelled).toBe(false);
    expect(adapters.orders.cancel({ ...o, stage: 1 }).cancelled).toBe(true);
  });
  it('searches name, description and category', () => {
    expect(adapters.catalog.search('herbal', 'honey').length).toBeGreaterThan(0);
    expect(adapters.catalog.search('herbal', 'zzzz')).toEqual([]);
  });
});

describe('placing an order', () => {
  const nav = vi.fn();
  const fill = () => {
    useCartStore.getState().add('h7', 0, 1);
    useCheckoutStore.getState().set({
      name: 'Asha Rao', phone: '9876543210', addr: '12 Lake View Road', city: 'Chennai', pin: '600001', state: 'Tamil Nadu', upi: 'asha@upi',
    });
  };
  it('returns validation errors without touching the cart', () => {
    useCartStore.getState().add('h7', 0, 1);
    expect(Object.keys(placeOrder(nav))).toContain('name');
    expect(useCartStore.getState().lines).toHaveLength(1);
  });
  it('opens sign-in when signed out and resumes afterwards', async () => {
    vi.useFakeTimers();
    fill();
    expect(placeOrder(nav)).toEqual({});
    expect(useUiStore.getState().modal?.t).toBe('auth');
    useAuthStore.getState().signIn({ name: 'Asha', phone: '9876543210' });
    useUiStore.getState().afterAuth!();
    expect(useUiStore.getState().modal?.t).toBe('busy');
    await vi.advanceTimersByTimeAsync(1300);
    vi.useRealTimers();
    const orders = useOrdersStore.getState().orders;
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ tpl: 'herbal', stage: 0, cancelled: false, pay: 'upi' });
    expect(useCartStore.getState()).toMatchObject({ lines: [], coupon: null });
    expect(nav).toHaveBeenCalledWith(`/success/${orders[0].id}`);
  });
});
