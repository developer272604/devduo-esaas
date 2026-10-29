import { beforeEach, describe, expect, it } from 'vitest';
import { STD_SHIP, computeTotals, couponDiscount, freeShipRemaining, shippingFee, type PricedLine } from '@/lib/pricing';
import { inr } from '@/lib/format';
import { useCartStore } from '@/store/cart';
import { TEMPLATES } from '@/templates';
import type { Product } from '@/lib/types';

const item = (price: number): Product => ({ id: 't', cat: 'c', name: 'Item', price, mrp: price, emoji: '📦', rating: 4, rev: 1, desc: '' });
const line = (price: number, qty = 1): PricedLine => ({ product: item(price), o: 0, qty });
const totalsAt = (price: number, freeAt: number) => computeTotals([line(price)], { coupon: null, speed: 'std', pay: 'upi', freeAt });

describe('each template has its own free-delivery threshold', () => {
  it('uses the thresholds the banners promise', () => {
    expect(Object.fromEntries(Object.values(TEMPLATES).map((t) => [t.id, t.freeShipAt]))).toEqual({
      herbal: 499, gadgets: 999, fashion: 2000, marketplace: 999, wellness: 999,
    });
  });

  for (const t of Object.values(TEMPLATES)) {
    it(`${t.name}: free exactly at ${inr(t.freeShipAt)}, ${inr(STD_SHIP)} one rupee below`, () => {
      expect(totalsAt(t.freeShipAt, t.freeShipAt).ship).toBe(0);
      expect(totalsAt(t.freeShipAt - 1, t.freeShipAt).ship).toBe(STD_SHIP);
      expect(freeShipRemaining(t.freeShipAt - 1, t.freeShipAt)).toBe(1);
      expect(freeShipRemaining(t.freeShipAt, t.freeShipAt)).toBe(0);
      expect(freeShipRemaining(t.freeShipAt + 500, t.freeShipAt)).toBe(0);
    });

    it(`${t.name}: every sentence about free delivery names its own threshold and no other amount`, () => {
      const sentences: string[] = [t.announce];
      const walk = (v: unknown) => {
        if (typeof v === 'string') sentences.push(v);
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') Object.values(v).forEach(walk);
      };
      walk(t.home);
      const about = sentences.filter((s) => /shipping|delivery/i.test(s));
      // Marketly's banner is about a sale and may not mention delivery; others must.
      if (t.id !== 'marketplace') expect(about.length).toBeGreaterThan(0);
      for (const s of about) {
        for (const amount of s.match(/₹[\d,]+/g) ?? []) expect(amount, s).toBe(inr(t.freeShipAt));
      }
      if (/shipping|delivery/i.test(t.announce)) expect(t.announce).toContain(inr(t.freeShipAt));
    });
  }

  it('the old shared default still applies when a caller passes no threshold', () => {
    expect(shippingFee(999, 'std', null)).toBe(0);
    expect(shippingFee(998, 'std', null)).toBe(STD_SHIP);
  });

  it('express is never free, whatever the threshold or coupon', () => {
    expect(shippingFee(100_000, 'exp', null, true, 499)).toBe(129);
    expect(shippingFee(100_000, 'exp', 'FREESHIP', true, 499)).toBe(129);
  });
});

describe('coupons never stack or exceed their limit', () => {
  beforeEach(() => useCartStore.setState({ lines: [], coupon: null }));

  it('a cart holds one coupon: applying a second replaces the first', () => {
    const c = useCartStore.getState();
    c.setCoupon('WELCOME10');
    c.setCoupon('FREESHIP');
    expect(useCartStore.getState().coupon).toBe('FREESHIP');
  });

  it('WELCOME10 takes 10% and never more than 500, and gives no free shipping', () => {
    const t = computeTotals([line(1000)], { coupon: 'WELCOME10', speed: 'std', pay: 'upi', freeAt: 2000 });
    expect(t.disc).toBe(100);
    expect(t.ship).toBe(STD_SHIP);
    expect(couponDiscount('WELCOME10', 4999)).toBe(500);
    expect(couponDiscount('WELCOME10', 5000)).toBe(500);
    expect(couponDiscount('WELCOME10', 1_000_000)).toBe(500);
  });

  it('FREESHIP removes the delivery fee on standard but gives no discount', () => {
    const t = computeTotals([line(100)], { coupon: 'FREESHIP', speed: 'std', pay: 'upi', freeAt: 2000 });
    expect(t.ship).toBe(0);
    expect(t.disc).toBe(0);
  });

  it('the total never goes below zero', () => {
    const t = computeTotals([line(1)], { coupon: 'WELCOME10', speed: 'std', pay: 'upi' });
    expect(t.total).toBeGreaterThan(0);
  });
});
