import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Product } from '@/lib/types';
import { useCatalog } from '@/lib/hooks';
import { ProductGrid } from '@/components/common/ProductCard';
import { Crumbs, EmptyState } from '@/components/common/bits';
import { Icon } from '@/components/common/Icon';
import { Txt } from '@/components/demo/Txt';
import { Pagination } from '@/components/list/Pagination';
import { Sidebar } from '@/components/list/Sidebar';
import { Toolbar } from '@/components/list/Toolbar';
import { ValueStrip } from '@/components/list/ValueStrip';
import { SlidersIcon } from '@/components/list/icons';
import {
  activeCount, applyFilters, matchesOffer, packOptions, paginate, priceBounds, sortProducts,
  type Filters, type OfferKey, type Sort, type View,
} from '@/components/list/model';

const NARROW = '(max-width: 1024px)';

/** True on tablet and phone widths, where the filters live in a drawer. */
function useNarrow(): boolean {
  const get = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(NARROW).matches;
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(NARROW);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

type Props = {
  title: string;
  blurb: string;
  items: Product[];
  trail: { label: string; href?: string }[];
  emptyText?: string;
  /** Slot ids that make the heading and intro editable. */
  titleId?: string;
  blurbId?: string;
  /** Category slug to mark in the sidebar, or `all` on the shop page. Nothing marked when left out (search). */
  activeSlug?: string;
  /** Small label above the heading. Defaults to the store's tagline. */
  eyebrow?: string;
};

export function ListView({ title, blurb, items, trail, emptyText, titleId, blurbId, activeSlug, eyebrow }: Props) {
  const { template, products, freeShipAt } = useCatalog();
  const narrow = useNarrow();

  const [sort, setSort] = useState<Sort>('feat');
  const [view, setView] = useState<View>('grid');
  const [page, setPage] = useState(1);
  const [price, setPrice] = useState<[number, number] | null>(null);
  const [packs, setPacks] = useState<string[]>([]);
  const [offers, setOffers] = useState<OfferKey[]>([]);
  const [open, setOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const bounds = useMemo(() => priceBounds(items), [items]);
  const filters: Filters = useMemo(
    () => ({
      min: price ? Math.min(bounds.hi, Math.max(bounds.lo, price[0])) : bounds.lo,
      max: price ? Math.min(bounds.hi, Math.max(bounds.lo, price[1])) : bounds.hi,
      packs,
      offers,
    }),
    [price, packs, offers, bounds],
  );
  const filtered = useMemo(() => sortProducts(applyFilters(items, filters, freeShipAt), sort), [items, filters, freeShipAt, sort]);
  const paging = paginate(filtered, page);

  const packOpts = useMemo(() => packOptions(items), [items]);
  const offerList = useMemo(
    () =>
      (['sale', 'free', 'rated'] as OfferKey[])
        .map((key) => ({ key, count: items.filter((p) => matchesOffer(p, key, freeShipAt)).length }))
        .filter((o) => o.count > 0 || offers.includes(o.key)),
    [items, freeShipAt, offers],
  );
  const top = useMemo(() => [...items].sort((a, b) => b.rating - a.rating || b.rev - a.rev).slice(0, 3), [items]);
  const cats = useMemo(() => template.cats.map((c) => ({ slug: c.slug, name: c.name, count: products.filter((p) => p.cat === c.slug).length })), [template, products]);

  // Any change to what is listed goes back to the first page.
  const change = <T,>(set: Dispatch<SetStateAction<T>>) => (v: T) => {
    set(v);
    setPage(1);
  };
  const applyPrice = change(setPrice);
  const clearAll = () => {
    setPrice(null);
    setPacks([]);
    setOffers([]);
    setPage(1);
  };

  const drawer = open && narrow;
  useEffect(() => {
    if (!narrow) setOpen(false);
  }, [narrow]);
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  const goPage = (n: number) => {
    setPage(n);
    toolsRef.current?.scrollIntoView?.({ block: 'start' });
  };

  const count = activeCount(filters, bounds);
  const hasItems = items.length > 0;

  return (
    <div className="cat">
      <div className="cat-hero">
        <div className="wrap">
          <Crumbs trail={trail} />
          <span className="cat-eyebrow">
            <Icon name="leaf" size={14} />
            {eyebrow ?? template.tag}
          </span>
          <div className="ph">
            <h1>{titleId ? <Txt id={titleId} text={title} /> : title}</h1>
            {blurb && <p>{blurbId ? <Txt id={blurbId} text={blurb} /> : blurb}</p>}
          </div>
        </div>
      </div>

      <div className="wrap cat-body">
        {hasItems ? (
          <>
            <Sidebar
              cats={cats}
              allCount={products.length}
              activeSlug={activeSlug}
              filters={filters}
              bounds={bounds}
              showPrice={items.length > 1 && bounds.hi > bounds.lo}
              packs={packOpts}
              offers={offerList}
              top={items.length > 1 ? top : []}
              resultCount={filtered.length}
              drawer={drawer}
              onClose={() => setOpen(false)}
              onPrice={(min, max) => applyPrice(min <= bounds.lo && max >= bounds.hi ? null : [min, max])}
              onTogglePack={(v) => change(setPacks)(toggle(packs, v))}
              onToggleOffer={(k) => change(setOffers)(toggle(offers, k))}
              onClearPrice={() => applyPrice(null)}
              onReset={clearAll}
            />
            <div className="cat-main">
              <Toolbar ref={toolsRef} paging={paging} view={view} sort={sort} onView={setView} onSort={change(setSort)} />
              {paging.total ? (
                <div className={`cat-results${view === 'list' ? ' is-list' : ''}`}>
                  <ProductGrid products={paging.slice} level={2} />
                </div>
              ) : (
                <EmptyState
                  emoji="🔍"
                  title="No products match"
                  text={emptyText ?? 'Try widening the price range or removing a filter.'}
                  action={count ? { label: 'Reset all filters', onClick: clearAll } : { label: 'Browse all products', href: '/shop' }}
                />
              )}
              <Pagination paging={paging} onPage={goPage} />
            </div>
          </>
        ) : (
          <EmptyState emoji="🔍" title="No products match" text={emptyText ?? 'Nothing here yet.'} action={{ label: 'Browse all products', href: '/shop' }} />
        )}
      </div>

      {hasItems && <ValueStrip template={template} />}

      {hasItems && (
        <button type="button" className="cat-fab" onClick={() => setOpen(true)} aria-haspopup="dialog" data-no-capture>
          <SlidersIcon />
          Filters
          {count > 0 && <span className="cat-badge">{count}</span>}
        </button>
      )}
    </div>
  );
}
