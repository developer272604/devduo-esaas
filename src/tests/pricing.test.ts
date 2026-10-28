import { describe, expect, it } from 'vitest';
import {
  codFee, computeTotals, couponDiscount, fromPrice, lineKey, mrpSavings, normaliseCoupon, parseLineKey,
  shippingFee, subtotal, unitMrp, unitPrice, type PricedLine,
} from '@/lib/pricing';
import { P, PACKS } from '@/templates/helpers';

const honey = P('t1', 'c', 'Honey', 400, 500, '🍯', 4.5, 10, 'x', { opts: PACKS });
const plain = P('t2', 'c', 'Tea', 250, 300, '🍵', 4.5, 10, 'x');
const L = (product = plain, o = 0, qty = 1): PricedLine => ({ product, o, qty });

describe('unit price', () => {
  it('applies the option multiplier and rounds to whole rupees', () => {
    expect(unitPrice(honey, 0)).toBe(400);
    expect(unitPrice(honey, 1)).toBe(720);
    expect(unitPrice(honey, 2)).toBe(1320);
    expect(unitMrp(honey, 1)).toBe(900);
  });
  it('is 1x for products without options', () => {
    expect(unitPrice(plain, 0)).toBe(250);
    expect(unitPrice(plain, 3)).toBe(250);
  });
  it('reports a From price only when options change the price', () => {
    expect(fromPrice(honey)).toEqual({ price: 400, mrp: 500, from: true });
    expect(fromPrice(plain).from).toBe(false);
    const sized = P('t3', 'c', 'Shirt', 999, 1200, '👔', 4, 1, 'x', { opts: { label: 'Size', values: ['S', 'M'] } });
    expect(fromPrice(sized).from).toBe(false);
  });
});

describe('subtotal and savings', () => {
  it('sums lines with quantity and option', () => {
    expect(subtotal([L(plain, 0, 2), L(honey, 1, 1)])).toBe(500 + 720);
  });
  it('computes MRP savings', () => {
    expect(mrpSavings([L(plain, 0, 2)])).toBe(100);
  });
});

describe('coupons', () => {
  it('WELCOME10 is 10% capped at 500', () => {
    expect(couponDiscount('WELCOME10', 1000)).toBe(100);
    expect(couponDiscount('WELCOME10', 9000)).toBe(500);
    expect(couponDiscount('WELCOME10', 10000)).toBe(500);
    expect(couponDiscount(null, 1000)).toBe(0);
    expect(couponDiscount('FREESHIP', 1000)).toBe(0);
  });
  it('normalises codes', () => {
    expect(normaliseCoupon(' welcome10 ')).toBe('WELCOME10');
    expect(normaliseCoupon('freeship')).toBe('FREESHIP');
    expect(normaliseCoupon('nope')).toBeNull();
  });
});

describe('shipping and COD', () => {
  it('standard is free from 999, otherwise 59', () => {
    expect(shippingFee(998, 'std', null)).toBe(59);
    expect(shippingFee(999, 'std', null)).toBe(0);
  });
  it('FREESHIP makes standard free but express stays 129', () => {
    expect(shippingFee(100, 'std', 'FREESHIP')).toBe(0);
    expect(shippingFee(5000, 'exp', 'FREESHIP')).toBe(129);
  });
  it('charges nothing for an empty cart', () => {
    expect(shippingFee(0, 'std', null, false)).toBe(0);
    expect(codFee('cod', false)).toBe(0);
  });
  it('COD adds 40', () => {
    expect(codFee('cod')).toBe(40);
    expect(codFee('upi')).toBe(0);
  });
});

describe('computeTotals', () => {
  it('combines everything into the total', () => {
    const t = computeTotals([L(plain, 0, 2)], { coupon: 'WELCOME10', speed: 'std', pay: 'cod' });
    // 500 subtotal, 50 off, 59 shipping, 40 COD
    expect(t).toMatchObject({ sub: 500, disc: 50, ship: 59, cod: 40, total: 549, save: 100 });
  });
  it('free standard shipping at the threshold', () => {
    const t = computeTotals([L(plain, 0, 4)], { coupon: null, speed: 'std', pay: 'upi' });
    expect(t.ship).toBe(0);
    expect(t.total).toBe(1000);
  });
  it('is all zeros when empty', () => {
    expect(computeTotals([], { coupon: 'WELCOME10', speed: 'exp', pay: 'cod' })).toEqual({ sub: 0, mrp: 0, save: 0, disc: 0, ship: 0, cod: 0, total: 0 });
  });
});

describe('cart line keys', () => {
  it('round-trips productId|optionIndex', () => {
    expect(lineKey('h1', 2)).toBe('h1|2');
    expect(parseLineKey('h1|2')).toEqual({ id: 'h1', o: 2 });
  });
});
