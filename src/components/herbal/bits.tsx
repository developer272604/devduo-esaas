import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import Link from '@/components/common/Link';
import { Art } from '@/components/common/Art';
import { Txt, productNameId, useProductName } from '@/components/demo/Txt';
import { useCatalog } from '@/lib/hooks';
import { inr, pct } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { useWishlistStore } from '@/store/wishlist';
import { BrandLogo } from '@/components/common/BrandLogo';

/** Routes in templates are written without a leading slash. */
export const to = (go: string) => (go.startsWith('/') ? go : `/${go}`);

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`ot-mark ${className}`} aria-hidden="true" fill="none">
      <circle cx="20" cy="20" r="19" className="m1" />
      <path d="M12 27c0-9 6-15 17-15 0 9-5 15-14 15-1 0-2 0-3 0Z" className="m2" />
      <path d="M12 28c4-6 8-9 13-12" className="m3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function OtLogo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { template } = useCatalog();
  return (
    <Link className={`ot-logo ${tone}`} href="/" aria-label={`${template.name} home`}>
      <BrandLogo><LogoMark /></BrandLogo>
      <span>
        <Txt as="b" id="brand.name" text={template.name} />
        <small>{template.tag}</small>
      </span>
    </Link>
  );
}

/** Scroll-reveal. Content below the fold settles in once it is about to be seen. The screenshot tool shows everything. */
export function Reveal({ children, delay = 0, y = 18, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') return setSeen(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return (
    <div ref={ref} className={`ot-rv${seen ? ' in' : ''} ${className}`.trim()} style={{ '--d': `${delay}s`, '--y': `${y}px` } as CSSProperties}>
      {children}
    </div>
  );
}

const LEAVES = [
  { left: '6%', size: 22, dur: 16, delay: 0 },
  { left: '17%', size: 14, dur: 21, delay: 5 },
  { left: '31%', size: 18, dur: 18, delay: 9 },
  { left: '46%', size: 12, dur: 24, delay: 2 },
  { left: '58%', size: 24, dur: 19, delay: 12 },
  { left: '71%', size: 16, dur: 22, delay: 7 },
  { left: '84%', size: 20, dur: 17, delay: 3 },
  { left: '93%', size: 13, dur: 25, delay: 14 },
];

/** Decorative drifting leaves that fill their positioned parent. */
export function FallingLeaves({ count = LEAVES.length }: { count?: number }) {
  return (
    <div aria-hidden="true" className="ot-leaves">
      {LEAVES.slice(0, count).map((l, i) => (
        <svg key={i} viewBox="0 0 40 40" width={l.size} height={l.size} style={{ left: l.left, animation: `ot-drift ${l.dur}s linear ${l.delay}s infinite` }}>
          <path fill="currentColor" d="M6 30C6 14 16 6 34 6 34 22 26 34 11 34c-2 0-4-1-5-4Z" />
          <path d="M8 32C15 22 22 16 30 10" className="vein" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}

/** Stars with partial fill, for a rating such as 4.6. Decorative; the text next to it carries the meaning. */
export function OtStars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="ot-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} style={{ width: size, height: size }}>
            <Star width={size} height={size} className="back" fill="currentColor" strokeWidth={0} />
            <span style={{ width: `${fill * 100}%` }}>
              <Star width={size} height={size} className="front" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function OtRating({ rating, count, size = 14 }: { rating: number; count: number; size?: number }) {
  if (!rating || !count) return null;
  return (
    <p className="ot-rating">
      <OtStars value={rating} size={size} />
      <span className="sr-only">
        Rated {rating} out of 5 from {count} review{count === 1 ? '' : 's'}
      </span>
      <b aria-hidden="true">{rating.toFixed(1)}</b>
      <span aria-hidden="true">({count.toLocaleString('en-IN')})</span>
    </p>
  );
}

/** The wishlist heart that sits on a product photo. */
export function OtHeart({ product, name }: { product: Product; name: string }) {
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const toast = useUiStore((s) => s.showToast);
  return (
    <button
      type="button"
      className={`ot-heart${wished ? ' on' : ''}`}
      aria-label={`${wished ? 'Remove from' : 'Add to'} wishlist: ${name}`}
      aria-pressed={wished}
      onClick={() => {
        const added = toggle(product.id);
        toast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? { label: 'View wishlist', href: '/wishlist' } : undefined);
      }}
    >
      <Heart aria-hidden="true" strokeWidth={1.8} />
    </button>
  );
}

/** Compact bordered product card used by the carousels. Adds the first option straight to the cart. */
export function OtCard({ product: p }: { product: Product }) {
  const name = useProductName(p.id, p.name);
  const { price, mrp, from } = fromPrice(p);
  const off = pct(price, mrp);
  const add = useCartStore((s) => s.add);
  const openCart = useUiStore((s) => s.openCart);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <article className="ot-card">
      <div className="ot-card-img">
        <Art id={p.id} emoji={p.emoji} name="" image={p.image} sizes="(max-width: 700px) 45vw, 230px" editable />
        <OtHeart product={p} name={name} />
      </div>
      <div className="ot-card-body">
        <h3>
          <Link href={`/product/${p.id}`}>
            <Txt id={productNameId(p.id)} text={p.name} />
          </Link>
        </h3>
        <OtRating rating={p.rating} count={p.rev} size={13} />
        <p className="ot-price">
          {from && <small>From</small>}
          <b>{inr(price)}</b>
          {mrp > price && (
            <s>
              <span className="sr-only">MRP </span>
              {inr(mrp)}
            </s>
          )}
          {off >= 20 && <em>{off}% off</em>}
        </p>
        <button
          type="button"
          className="ot-btn ot-add"
          onClick={() => {
            add(p.id, 0, 1);
            setAdded(true);
            openCart();
          }}
        >
          <span key={added ? 'a' : 'i'}>{added ? 'Added' : 'Add to cart'}</span>
        </button>
      </div>
    </article>
  );
}

/** Prev / next that wrap around, plus gentle autoplay while the row is on screen. Paused on hover, focus and touch. */
export function useLoopCarousel(autoplayMs: number) {
  const track = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir === -1 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    else el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }, []);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io?.observe(el);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = el.children[0] as HTMLElement | undefined;
        if (!first) return;
        const pitch = (el.children[1] as HTMLElement | undefined)?.offsetLeft ?? first.offsetWidth;
        setIndex(Math.round(el.scrollLeft / Math.max(1, pitch - first.offsetLeft)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io?.disconnect();
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (paused || !visible || reduced) return;
    const t = setInterval(() => step(1), autoplayMs);
    return () => clearInterval(t);
  }, [paused, visible, reduced, autoplayMs, step]);

  const pauseProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onTouchStart: () => setPaused(true),
    onTouchEnd: () => setPaused(false),
  };
  return { track, step, goTo, index, reduced, pauseProps };
}

/** Looping product swiper with a heading, a link and prev / next buttons. */
export function OtCarousel({ id, title, titleSlot, link, go, linkSlot, contained = true, children }: { id: string; title: string; titleSlot?: string; link: string; go: string; linkSlot?: string; contained?: boolean; children: ReactNode }) {
  const { track, step, pauseProps } = useLoopCarousel(4500);
  const label = (
    <>
      {linkSlot ? <Txt id={linkSlot} text={link} /> : link} <ArrowRight aria-hidden="true" />
    </>
  );
  return (
    <section id={id} aria-labelledby={`${id}-h`} aria-roledescription="carousel" className={`ot-sec${contained ? ' wrap' : ''}`}>
      <div className="ot-sh">
        <h2 id={`${id}-h`}>{titleSlot ? <Txt id={titleSlot} text={title} /> : title}</h2>
        <div className="ot-sh-r">
          <Link href={to(go)} className="ot-link only-d">
            {label}
          </Link>
          <button type="button" className="ot-round" aria-label={`Previous ${title}`} onClick={() => step(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="ot-round" aria-label={`Next ${title}`} onClick={() => step(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul ref={track} {...pauseProps} className="ot-track">
        {Children.map(children, (child) => (
          <li>{child}</li>
        ))}
      </ul>
      <Link href={to(go)} className="ot-link only-m">
        {label}
      </Link>
    </section>
  );
}
