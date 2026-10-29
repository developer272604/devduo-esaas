import type { CartLine, Coupon, PayMethod, Product, ShipSpeed, Totals } from './types';
import { MAX_QTY } from './constants';

/** Default threshold, used when a caller does not pass one. Templates set their own in their config. */
export const FREE_SHIP_AT = 999;
export const STD_SHIP = 59;
export const EXPRESS_SHIP = 129;
export const COD_FEE = 40;
export { MAX_QTY };
export const COUPONS: Coupon[] = ['WELCOME10', 'FREESHIP'];

export type PricedLine = { product: Product; o: number; qty: number };

export const lineKey = (id: string, o: number): string => `${id}|${o}`;
export const parseLineKey = (key: string): { id: string; o: number } => {
  const i = key.lastIndexOf('|');
  return { id: key.slice(0, i), o: Number(key.slice(i + 1)) || 0 };
};

const mult = (p: Product, o: number): number => p.opts?.mult?.[o] ?? 1;

/** Unit selling price for the chosen option, whole rupees. */
export const unitPrice = (p: Product, o = 0): number => Math.round(p.price * mult(p, o));
export const unitMrp = (p: Product, o = 0): number => Math.round(p.mrp * (p.opts?.mrpMult?.[o] ?? mult(p, o)));

/** Lowest price across options, shown as "From" on cards when options change the price. */
export function fromPrice(p: Product): { price: number; mrp: number; from: boolean } {
  const n = p.opts?.mult?.length ?? 0;
  if (!n) return { price: p.price, mrp: p.mrp, from: false };
  let best = 0;
  for (let i = 1; i < n; i++) if (unitPrice(p, i) < unitPrice(p, best)) best = i;
  const varies = new Set(Array.from({ length: n }, (_, i) => unitPrice(p, i))).size > 1;
  return { price: unitPrice(p, best), mrp: unitMrp(p, best), from: varies };
}

export const subtotal =(lines: PricedLine[]): number => lines.reduce((a, l) => a + unitPrice(l.product, l.o) * l.qty, 0);
export const mrpTotal = (lines: PricedLine[]): number => lines.reduce((a, l) => a + unitMrp(l.product, l.o) * l.qty, 0);
export const mrpSavings = (lines: PricedLine[]): number => mrpTotal(lines) - subtotal(lines);

export const normaliseCoupon = (raw: string): Coupon | null => {
  const c = raw.trim().toUpperCase();
  return (COUPONS as string[]).includes(c) ? (c as Coupon) : null;
};

/**
 * WELCOME10 is 10% off, capped at ₹500.
 * TODO(backend): coupon rules (first order only, usage limits, expiry, minimum basket) and every total here must be
 * recomputed on the server before charging. This browser copy is only a preview. See docs/PRODUCTION.md.
 */
export const couponDiscount = (coupon: Coupon | null, sub: number): number =>
  coupon === 'WELCOME10' ? Math.min(500, Math.round(sub * 0.1)) : 0;

export const shippingFee = (sub: number, speed: ShipSpeed, coupon: Coupon | null, hasItems = true, freeAt = FREE_SHIP_AT): number => {
  if (!hasItems) return 0;
  if (speed === 'exp') return EXPRESS_SHIP;
  return sub >= freeAt || coupon === 'FREESHIP' ? 0 : STD_SHIP;
};

export const codFee = (pay: PayMethod, hasItems = true): number => (pay === 'cod' && hasItems ? COD_FEE : 0);

export const freeShipRemaining = (sub: number, freeAt = FREE_SHIP_AT): number => Math.max(0, freeAt - sub);

export function computeTotals(
  lines: PricedLine[],
  opts: { coupon: Coupon | null; speed: ShipSpeed; pay: PayMethod; freeAt?: number },
): Totals {
  const has = lines.length > 0;
  const sub = subtotal(lines);
  const mrp = mrpTotal(lines);
  const disc = couponDiscount(opts.coupon, sub);
  const ship = shippingFee(sub, opts.speed, opts.coupon, has, opts.freeAt);
  const cod = codFee(opts.pay, has);
  return { sub, mrp, save: mrp - sub, disc, ship, cod, total: sub - disc + ship + cod };
}

export const toPriced = (cart: CartLine[], find: (id: string) => Product | undefined): PricedLine[] =>
  (Array.isArray(cart) ? cart : []).flatMap((l) => {
    const product = find(l.id);
    // Quantities are clamped here too, so a bad value can never reach a price.
    const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty)) || 1));
    const o = Number.isInteger(l.o) && l.o >= 0 ? l.o : 0;
    return product ? [{ product, o, qty }] : [];
  });
