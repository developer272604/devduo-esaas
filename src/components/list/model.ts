import { pct } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import type { Product } from '@/lib/types';

/** Products per page on every list page. */
export const PAGE_SIZE = 9;

export type Sort = 'feat' | 'plh' | 'phl' | 'rate' | 'disc';

export const SORTS: [Sort, string][] = [
  ['feat', 'Featured'],
  ['plh', 'Price: low to high'],
  ['phl', 'Price: high to low'],
  ['rate', 'Top rated'],
  ['disc', 'Biggest discount'],
];

export type View = 'grid' | 'list';

/** The three yes/no offers in the sidebar. */
export type OfferKey = 'sale' | 'free' | 'rated';

export const OFFER_LABELS: Record<OfferKey, string> = {
  sale: 'On sale',
  free: 'Free delivery eligible',
  rated: 'Rated 4.5 and up',
};

export type Filters = {
  /** Selected prices, whole rupees. Equal to the bounds when no price filter is on. */
  min: number;
  max: number;
  packs: string[];
  offers: OfferKey[];
};

export type Bounds = { lo: number; hi: number; step: number };

/** Slider range for a set of products: the lowest and highest "from" price, rounded out to the step. */
export function priceBounds(items: Product[]): Bounds {
  const prices = items.map((p) => fromPrice(p).price);
  if (!prices.length) return { lo: 0, hi: 0, step: 10 };
  const top = Math.max(...prices);
  const step = top > 20000 ? 100 : 10;
  return { lo: Math.floor(Math.min(...prices) / step) * step, hi: Math.ceil(top / step) * step, step };
}

export const emptyFilters = (b: Bounds): Filters => ({ min: b.lo, max: b.hi, packs: [], offers: [] });

export const priceActive = (f: Filters, b: Bounds): boolean => f.min > b.lo || f.max < b.hi;

export const activeCount = (f: Filters, b: Bounds): number => (priceActive(f, b) ? 1 : 0) + f.packs.length + f.offers.length;

/** Options (sizes, colours, packs) that exist across the products, in order of first appearance. */
export function packOptions(items: Product[]): { label: string; values: string[] } {
  const values: string[] = [];
  const labels = new Set<string>();
  for (const p of items) {
    if (!p.opts) continue;
    labels.add(p.opts.label);
    for (const v of p.opts.values) if (!values.includes(v)) values.push(v);
  }
  return { label: labels.size === 1 ? [...labels][0] : 'Options', values };
}

export function matchesOffer(p: Product, key: OfferKey, freeShipAt: number): boolean {
  if (key === 'sale') return p.mrp > p.price;
  if (key === 'rated') return p.rating >= 4.5;
  return fromPrice(p).price >= freeShipAt;
}

export function applyFilters(items: Product[], f: Filters, freeShipAt: number): Product[] {
  return items.filter((p) => {
    const price = fromPrice(p).price;
    if (price < f.min || price > f.max) return false;
    if (f.packs.length && !f.packs.some((v) => p.opts?.values.includes(v))) return false;
    return f.offers.every((k) => matchesOffer(p, k, freeShipAt));
  });
}

export function sortProducts(items: Product[], sort: Sort): Product[] {
  const by: Partial<Record<Sort, (a: Product, b: Product) => number>> = {
    plh: (a, b) => fromPrice(a).price - fromPrice(b).price,
    phl: (a, b) => fromPrice(b).price - fromPrice(a).price,
    rate: (a, b) => b.rating - a.rating || b.rev - a.rev,
    disc: (a, b) => pct(b.price, b.mrp) - pct(a.price, a.mrp),
  };
  const fn = by[sort];
  return fn ? [...items].sort(fn) : items;
}

export type Paging = { page: number; pages: number; from: number; to: number; total: number; slice: Product[]; shownPct: number };

/** One page of a list. A page number outside the range is pulled back in. */
export function paginate(list: Product[], page: number, size = PAGE_SIZE): Paging {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const cur = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const start = (cur - 1) * size;
  const slice = list.slice(start, start + size);
  const to = start + slice.length;
  return { page: cur, pages, from: total ? start + 1 : 0, to, total, slice, shownPct: total ? Math.round((to / total) * 100) : 0 };
}

/** Page buttons to show: all of them when there are few, otherwise the first, last and a window around the current one. */
export function pageList(cur: number, pages: number): (number | 'gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const lo = Math.max(2, cur - 1);
  const hi = Math.min(pages - 1, cur + 1);
  if (lo > 2) out.push('gap');
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < pages - 1) out.push('gap');
  out.push(pages);
  return out;
}

/** Parses what someone typed in a price box. Anything that is not a number falls back. */
export function parsePrice(raw: string, fallback: number): number {
  const digits = raw.replace(/[^\d.]/g, '');
  const n = Number(digits);
  return digits && Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Turns typed min and max into a valid, ordered range inside the bounds. */
export function clampRange(minRaw: string, maxRaw: string, b: Bounds): { min: number; max: number } {
  const clamp = (n: number) => Math.min(b.hi, Math.max(b.lo, n));
  const a = clamp(parsePrice(minRaw, b.lo));
  const z = clamp(parsePrice(maxRaw, b.hi));
  return a <= z ? { min: a, max: z } : { min: z, max: a };
}
