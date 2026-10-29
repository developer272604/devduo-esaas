import { useEffect, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { Art } from '@/components/common/Art';
import { Icon } from '@/components/common/Icon';
import { Stars } from '@/components/common/bits';
import { useNameOf } from '@/components/demo/Txt';
import { inr } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import { useFocusTrap } from '@/lib/useFocusTrap';
import type { Product } from '@/lib/types';
import { PriceRange } from './PriceRange';
import { OFFER_LABELS, type Bounds, type Filters, type OfferKey } from './model';

export type CatLink = { slug: string; name: string; count: number };

type Props = {
  cats: CatLink[];
  allCount: number;
  /** A category slug, `all` on the shop page, or nothing on search. */
  activeSlug?: string;
  filters: Filters;
  bounds: Bounds;
  showPrice: boolean;
  packs: { label: string; values: string[] };
  offers: { key: OfferKey; count: number }[];
  top: Product[];
  /** How many products the current filters leave, for the drawer's confirm button. */
  resultCount: number;
  /** True while the off-canvas drawer is open (only ever true on tablet and phone). */
  drawer: boolean;
  onClose: () => void;
  onPrice: (min: number, max: number) => void;
  onTogglePack: (v: string) => void;
  onToggleOffer: (k: OfferKey) => void;
  onClearPrice: () => void;
  onReset: () => void;
};

export function Sidebar(p: Props) {
  const ref = useRef<HTMLElement>(null);
  const nameOf = useNameOf();
  useFocusTrap(ref, p.drawer, p.onClose);

  // On desktop the sidebar sticks while you scroll, but only when it fits the screen. A taller one scrolls
  // with the page, so none of its widgets is ever out of reach.
  const [stick, setStick] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setStick(el.offsetHeight <= window.innerHeight - 112);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const priceOn = p.filters.min > p.bounds.lo || p.filters.max < p.bounds.hi;
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (priceOn) chips.push({ key: 'price', label: `${inr(p.filters.min)} – ${inr(p.filters.max)}`, remove: p.onClearPrice });
  for (const v of p.filters.packs) chips.push({ key: `pack:${v}`, label: v, remove: () => p.onTogglePack(v) });
  for (const k of p.filters.offers) chips.push({ key: `offer:${k}`, label: OFFER_LABELS[k], remove: () => p.onToggleOffer(k) });

  return (
    <>
      {p.drawer && <div className="cat-scrim" onClick={p.onClose} data-no-capture />}
      <section
        ref={ref}
        className={`cat-side${stick ? ' stick' : ''}${p.drawer ? ' open' : ''}`}
        aria-label="Filters"
        {...(p.drawer ? { role: 'dialog', 'aria-modal': true, tabIndex: -1 } : {})}
      >
        <div className="cat-side-head">
          <h2>Filters</h2>
          <button type="button" className="icon" aria-label="Close filters" onClick={p.onClose}>
            <Icon name="x" />
          </button>
        </div>

        <div className="cat-w">
          <div className="cat-wh">
            <h2>
              Applied filters{' '}
              {chips.length > 0 && (
                <span className="cat-badge">
                  {chips.length}
                  <span className="sr-only"> applied</span>
                </span>
              )}
            </h2>
            {chips.length > 0 && (
              <button type="button" className="cat-link" onClick={p.onReset}>
                Reset all
              </button>
            )}
          </div>
          {chips.length ? (
            <ul className="cat-chips">
              {chips.map((c) => (
                <li key={c.key}>
                  <button type="button" className="cat-chip" onClick={c.remove} aria-label={`Remove filter: ${c.label}`}>
                    <span>{c.label}</span>
                    <Icon name="x" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cat-none">Nothing applied yet.</p>
          )}
        </div>

        <nav className="cat-w" aria-label="Categories">
          <div className="cat-wh">
            <h2>Categories</h2>
          </div>
          <ul className="cat-cats">
            <li>
              <Link href="/shop" className={p.activeSlug === 'all' ? 'on' : undefined} aria-current={p.activeSlug === 'all' ? 'page' : undefined}>
                <span>All products</span>
                <small>{p.allCount}</small>
              </Link>
            </li>
            {p.cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className={p.activeSlug === c.slug ? 'on' : undefined} aria-current={p.activeSlug === c.slug ? 'page' : undefined}>
                  <span>{c.name}</span>
                  <small>{c.count}</small>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {p.showPrice && (
          <div className="cat-w">
            <div className="cat-wh">
              <h2>Price range</h2>
            </div>
            <PriceRange bounds={p.bounds} value={{ min: p.filters.min, max: p.filters.max }} onApply={p.onPrice} />
          </div>
        )}

        {p.packs.values.length > 0 && (
          <div className="cat-w">
            <div className="cat-wh">
              <h2>{p.packs.label}</h2>
            </div>
            <div className="cat-packs" role="group" aria-label={p.packs.label}>
              {p.packs.values.map((v) => {
                const on = p.filters.packs.includes(v);
                return (
                  <button key={v} type="button" className={`cat-pack${on ? ' on' : ''}`} aria-pressed={on} onClick={() => p.onTogglePack(v)}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {p.offers.length > 0 && (
          <div className="cat-w">
            <div className="cat-wh">
              <h2>Offers</h2>
            </div>
            <ul className="cat-offers">
              {p.offers.map((o) => (
                <li key={o.key}>
                  <label>
                    <input type="checkbox" checked={p.filters.offers.includes(o.key)} onChange={() => p.onToggleOffer(o.key)} />
                    <span>{OFFER_LABELS[o.key]}</span>
                    <small>{o.count}</small>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {p.top.length > 0 && (
          <div className="cat-w">
            <div className="cat-wh">
              <h2>Top rated</h2>
              <Icon name="star" size={16} filled style={{ color: 'var(--star)' }} />
            </div>
            <ul className="cat-top">
              {p.top.map((t) => {
                const { price, from } = fromPrice(t);
                return (
                  <li key={t.id}>
                    <Link href={`/product/${t.id}`}>
                      <span className="cat-top-img">
                        <Art id={t.id} emoji={t.emoji} name="" image={t.image} sizes="64px" />
                      </span>
                      <span className="cat-top-info">
                        <b>{nameOf(t.id, t.name)}</b>
                        <Stars rating={t.rating} />
                        <span>
                          {from ? 'From ' : ''}
                          {inr(price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="cat-side-foot">
          <button type="button" className="btn block" onClick={p.onClose}>
            Show {p.resultCount} product{p.resultCount === 1 ? '' : 's'}
          </button>
        </div>
      </section>
    </>
  );
}
