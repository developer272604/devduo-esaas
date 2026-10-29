import { FONT_NAMES, type CartLine, type CheckoutForm, type Coupon, type Order, type ThemeState, type User } from './types';
import { MAX_PARAGRAPH, MAX_QTY, MAX_STAGE } from './constants';
import { isHex } from './theme';

/**
 * Everything the app loads from localStorage passes through here first. Storage can be edited
 * by hand, left behind by an older build, or corrupted, so no stored value is trusted: each
 * sanitiser returns a safe value of the right type and never throws.
 */

const COUPON_CODES: Coupon[] = ['WELCOME10', 'FREESHIP'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.slice(0, max) : '');
const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const safeKey = (k: string) => k.length > 0 && k.length <= 120 && !FORBIDDEN_KEYS.has(k);

/** A quantity from storage: a whole number from 1 to MAX_QTY, or null when it is not usable. */
export function sanitizeQty(raw: unknown): number | null {
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  const whole = Math.floor(n);
  return whole >= 1 ? Math.min(MAX_QTY, whole) : null;
}

export function sanitizeCartLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: CartLine[] = [];
  for (const l of raw) {
    if (!isObject(l)) continue;
    const qty = sanitizeQty(l.qty);
    const o = typeof l.o === 'number' && Number.isInteger(l.o) && l.o >= 0 && l.o < 50 ? l.o : null;
    if (typeof l.id !== 'string' || !safeKey(l.id) || qty === null || o === null) continue;
    const key = `${l.id}|${o}`;
    if (seen.has(key)) continue; // two lines for the same product and option would double count
    seen.add(key);
    out.push({ id: l.id, o, qty });
  }
  return out;
}

export function sanitizeCoupon(raw: unknown): Coupon | null {
  return typeof raw === 'string' && (COUPON_CODES as string[]).includes(raw) ? (raw as Coupon) : null;
}

export function sanitizeUser(raw: unknown): User | null {
  if (!isObject(raw) || typeof raw.name !== 'string' || typeof raw.phone !== 'string') return null;
  const name = raw.name.trim().slice(0, 80);
  const phone = raw.phone.replace(/\D/g, '').slice(0, 10);
  return name && /^[6-9]\d{9}$/.test(phone) ? { name, phone } : null;
}

export function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === 'string' && safeKey(x)))];
}

const PAY = ['upi', 'card', 'cod'] as const;
const SHIP = ['std', 'exp'] as const;

function sanitizeOrder(raw: unknown): Order | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || !safeKey(raw.id) || typeof raw.tpl !== 'string') return null;
  const date = finite(raw.date);
  const stage = typeof raw.stage === 'number' && Number.isInteger(raw.stage) ? raw.stage : null;
  if (date === null || stage === null || stage < 0 || stage > MAX_STAGE) return null;
  if (!PAY.includes(raw.pay as never) || !SHIP.includes(raw.ship as never) || typeof raw.cancelled !== 'boolean') return null;
  if (!Array.isArray(raw.items) || raw.items.length === 0 || !isObject(raw.t) || !isObject(raw.addr)) return null;

  const items = [];
  for (const i of raw.items) {
    if (!isObject(i) || typeof i.id !== 'string') return null;
    const qty = sanitizeQty(i.qty);
    const price = finite(i.price);
    if (qty === null || price === null || price < 0) return null;
    items.push({ id: i.id, name: str(i.name, 200), emoji: str(i.emoji, 8), opt: str(i.opt, 80), qty, price });
  }
  const t: Record<string, number> = {};
  for (const k of ['sub', 'mrp', 'save', 'disc', 'ship', 'cod', 'total']) {
    const n = finite((raw.t as Record<string, unknown>)[k]);
    if (n === null || n < 0) return null;
    t[k] = n;
  }
  const a = raw.addr as Record<string, unknown>;
  return {
    id: raw.id,
    tpl: raw.tpl,
    date,
    items,
    t: t as unknown as Order['t'],
    addr: { name: str(a.name, 80), phone: str(a.phone, 10), addr: str(a.addr, 200), city: str(a.city, 80), pin: str(a.pin, 6), state: str(a.state, 80) },
    pay: raw.pay as Order['pay'],
    ship: raw.ship as Order['ship'],
    stage,
    cancelled: raw.cancelled,
  };
}

export function sanitizeOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.flatMap((o) => {
    const clean = sanitizeOrder(o);
    if (!clean || seen.has(clean.id)) return [];
    seen.add(clean.id);
    return [clean];
  });
}

export function sanitizeCheckout(raw: unknown, base: CheckoutForm): CheckoutForm {
  const r = isObject(raw) ? raw : {};
  return {
    ...base,
    name: str(r.name, 80),
    phone: str(r.phone, 10).replace(/\D/g, ''),
    addr: str(r.addr, 200),
    city: str(r.city, 80),
    pin: str(r.pin, 6).replace(/\D/g, ''),
    state: str(r.state, 80),
    upi: str(r.upi, 80),
    ship: SHIP.includes(r.ship as never) ? (r.ship as CheckoutForm['ship']) : base.ship,
    pay: PAY.includes(r.pay as never) ? (r.pay as CheckoutForm['pay']) : base.pay,
    // card details are never read back from storage
    card: '',
    exp: '',
    cvv: '',
  };
}

/** `{ templateId: { slot: text } }` with plain, bounded strings only. */
export function sanitizeTexts(raw: unknown): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  if (!isObject(raw)) return out;
  for (const [tpl, bag] of Object.entries(raw)) {
    if (!safeKey(tpl) || !isObject(bag)) continue;
    const inner: Record<string, string> = {};
    for (const [k, v] of Object.entries(bag)) if (safeKey(k) && typeof v === 'string' && v.trim()) inner[k] = v.slice(0, MAX_PARAGRAPH);
    out[tpl] = inner;
  }
  return out;
}

/** Replacement images must be inline raster data. Anything else (a URL, SVG, HTML) would load from the network or run. */
const IMAGE_DATA = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;
export const isImageData = (v: unknown): v is string => typeof v === 'string' && v.length < 3_000_000 && IMAGE_DATA.test(v);

export function sanitizeImages(raw: unknown): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  if (!isObject(raw)) return out;
  for (const [tpl, bag] of Object.entries(raw)) {
    if (!safeKey(tpl) || !isObject(bag)) continue;
    const inner: Record<string, string> = {};
    for (const [k, v] of Object.entries(bag)) if (safeKey(k) && isImageData(v)) inner[k] = v;
    out[tpl] = inner;
  }
  return out;
}

/** Saved looks per template. An entry that is not a complete, valid theme is dropped, so the template default applies. */
export function sanitizeThemes(raw: unknown): Record<string, ThemeState> {
  const out: Record<string, ThemeState> = {};
  if (!isObject(raw)) return out;
  for (const [tpl, t] of Object.entries(raw)) {
    if (!safeKey(tpl) || !isObject(t)) continue;
    const ok =
      typeof t.primary === 'string' && isHex(t.primary) &&
      (FONT_NAMES as readonly string[]).includes(t.font as string) &&
      (t.mode === 'light' || t.mode === 'dark') &&
      (t.radius === 'sharp' || t.radius === 'soft' || t.radius === 'round');
    if (ok) out[tpl] = { primary: t.primary as string, font: t.font as ThemeState['font'], mode: t.mode as ThemeState['mode'], radius: t.radius as ThemeState['radius'] };
  }
  return out;
}

/** Rebuilds a persisted store's state from untrusted stored JSON. */
export const persistedState = (persisted: unknown): Record<string, unknown> => (isObject(persisted) ? persisted : {});
