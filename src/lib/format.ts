/** Whole rupees, en-IN grouping. */
export const inr = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN');

export const fmtDate = (t: number): string =>
  new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtWeekday = (t: number): string =>
  new Date(t).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

/** Small deterministic hash, used to vary art tints per product. */
export const hash = (s: string): number => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

export const pct = (price: number, mrp: number): number => (mrp > price ? Math.round((1 - price / mrp) * 100) : 0);
