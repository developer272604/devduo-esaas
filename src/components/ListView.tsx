import { useEffect, useMemo, useRef, useState } from 'react';
import { inr, pct } from '@/lib/format';
import type { Product } from '@/lib/types';
import { fromPrice } from '@/lib/pricing';
import { ProductGrid } from '@/components/common/ProductCard';
import { Crumbs, EmptyState } from '@/components/common/bits';

type Sort = 'feat' | 'plh' | 'phl' | 'rate' | 'disc';

const SORTS: [Sort, string][] = [
  ['feat', 'Featured'],
  ['plh', 'Price: low to high'],
  ['phl', 'Price: high to low'],
  ['rate', 'Top rated'],
  ['disc', 'Biggest discount'],
];

/** Range input that shows its value live while dragging and only applies the filter on release. */
function PriceSlider({ min, max, value, onCommit }: { min: number; max: number; value: number; onCommit: (n: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(value);
  const commit = useRef(onCommit);
  commit.current = onCommit;

  useEffect(() => setLive(value), [value]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => commit.current(Number(el.value));
    el.addEventListener('change', done); // native change fires on release, not while dragging
    return () => el.removeEventListener('change', done);
  }, []);

  return (
    <label>
      Up to <b>{inr(live)}</b>{' '}
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={max > 20000 ? 100 : 10}
        defaultValue={value}
        key={`${min}-${max}`}
        onInput={(e) => setLive(Number((e.target as HTMLInputElement).value))}
        aria-label="Maximum price"
      />
    </label>
  );
}

type Props = { title: string; blurb: string; items: Product[]; trail: { label: string; href?: string }[]; emptyText?: string };

export function ListView({ title, blurb, items, trail, emptyText }: Props) {
  const [sort, setSort] = useState<Sort>('feat');
  const [sale, setSale] = useState(false);
  const bounds = useMemo(() => {
    const prices = items.map((p) => fromPrice(p).price);
    const hi = Math.max(0, ...prices);
    return { lo: Math.min(...prices, hi), hi };
  }, [items]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const cap = maxPrice === null || maxPrice > bounds.hi ? bounds.hi : maxPrice;

  const list = useMemo(() => {
    const out = items.filter((p) => fromPrice(p).price <= cap && (!sale || p.mrp > p.price));
    const by: Partial<Record<Sort, (a: Product, b: Product) => number>> = {
      plh: (a, b) => fromPrice(a).price - fromPrice(b).price,
      phl: (a, b) => fromPrice(b).price - fromPrice(a).price,
      rate: (a, b) => b.rating - a.rating,
      disc: (a, b) => pct(b.price, b.mrp) - pct(a.price, a.mrp),
    };
    const fn = by[sort];
    return fn ? [...out].sort(fn) : out;
  }, [items, cap, sale, sort]);

  return (
    <div className="wrap page">
      <Crumbs trail={trail} />
      <div className="ph">
        <h1>{title}</h1>
        {blurb && <p>{blurb}</p>}
      </div>
      <div className="tools">
        <label>
          Sort{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        {items.length > 1 && bounds.hi > bounds.lo && <PriceSlider min={bounds.lo} max={bounds.hi} value={cap} onCommit={setMaxPrice} />}
        <label>
          <input type="checkbox" checked={sale} onChange={(e) => setSale(e.target.checked)} /> On sale
        </label>
        <span className="sp" />
        <span aria-live="polite">
          {list.length} product{list.length === 1 ? '' : 's'}
        </span>
      </div>
      {list.length ? (
        <ProductGrid products={list} />
      ) : (
        <EmptyState
          emoji="🔍"
          title="No products match"
          text={emptyText ?? 'Try a higher price limit or clear the sale filter.'}
          action={{ label: 'Browse all products', href: '/shop' }}
        />
      )}
    </div>
  );
}
