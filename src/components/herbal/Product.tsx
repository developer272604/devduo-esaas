import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  BadgeCheck, Check, CheckCircle2, ChevronLeft, ChevronRight, Headset, Heart, Leaf, MapPin, Maximize2, Minus, PackageCheck, Plus, RotateCcw, Share2, ShieldCheck, ShoppingBag, Sparkles, Truck, X, XCircle, Zap, ZoomIn,
} from 'lucide-react';
import Link from '@/components/common/Link';
import Img from '@/components/common/Img';
import { Art, productSlot } from '@/components/common/Art';
import { Crumbs, EmptyState } from '@/components/common/bits';
import { Txt, productDescId, productNameId, useProductName, useText } from '@/components/demo/Txt';
import { useSlotImage } from '@/components/demo/SlotImg';
import { hash, inr, pct } from '@/lib/format';
import { useCatalog } from '@/lib/hooks';
import { useRouter } from '@/lib/nav';
import { MAX_QTY } from '@/lib/constants';
import { unitMrp, unitPrice } from '@/lib/pricing';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { useWishlistStore } from '@/store/wishlist';
import { OtCard, OtCarousel, OtRating, OtStars, Reveal } from './bits';

const SWIPE = 60;

/* ---------- gallery ---------- */

function Gallery({ p, name, index, onIndex }: { p: Product; name: string; index: number; onIndex: (i: number) => void }) {
  const custom = useSlotImage(productSlot(p.id));
  const photos = useMemo(() => {
    const list = p.images?.length ? [...p.images] : p.image ? [p.image] : [];
    if (custom && list.length) list[0] = custom;
    return list;
  }, [p.images, p.image, custom]);
  const drawn = photos.length === 0;
  const count = drawn ? 4 : photos.length;
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const down = useRef<{ x: number; y: number } | null>(null);
  const fsRef = useRef<HTMLDivElement>(null);
  const go = (n: number) => onIndex((n + count) % count);

  useFocusTrap(fsRef, full, () => setFull(false));
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndex((index + 1) % count);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + count) % count);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [full, index, count, onIndex]);

  const picture = (i: number, sizes: string, priority?: boolean) =>
    drawn ? <Art id={p.id} emoji={p.emoji} name={i === index ? name : ''} image={p.image} view={i} sizes={sizes} priority={priority} /> : <Img src={photos[i]} alt={`${name}, image ${i + 1}`} fill sizes={sizes} priority={priority} className="ot-cover" draggable={false} />;

  const onPointerDown = (e: PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = down.current;
    down.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (count > 1 && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && !(e.target as HTMLElement).closest('button')) setFull(true);
  };

  return (
    <div className="ot-gal">
      {count > 1 && (
        <div className="ot-thumbs" role="group" aria-label="Product images">
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" className={i === index ? 'on' : ''} aria-label={`Show image ${i + 1} of ${count}`} aria-pressed={i === index} onClick={() => onIndex(i)}>
              {drawn ? <Art id={p.id} emoji={p.emoji} name="" image={p.image} view={i} sizes="84px" /> : <Img src={photos[i]} alt="" fill sizes="84px" className="ot-cover" />}
            </button>
          ))}
        </div>
      )}
      <div className="ot-main">
        <div
          className="ot-main-img"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse' || drawn) return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onPointerLeave={() => setZoom(null)}
        >
          <div className="ot-zoom" style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
            {picture(index, '(max-width: 1000px) 100vw, 480px', true)}
          </div>
          {!drawn && (
            <span className="ot-hint">
              <ZoomIn aria-hidden="true" /> Hover to zoom
            </span>
          )}
          {count > 1 && (
            <>
              <button type="button" className="ot-arrow l" aria-label="Previous image" onClick={() => go(index - 1)}>
                <ChevronLeft aria-hidden="true" />
              </button>
              <button type="button" className="ot-arrow r" aria-label="Next image" onClick={() => go(index + 1)}>
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          )}
          <button type="button" className="ot-fs-btn" aria-label="View image fullscreen" onClick={() => setFull(true)}>
            <Maximize2 aria-hidden="true" />
          </button>
          {count > 1 && (
            <div className="ot-pips" aria-hidden="true">
              {Array.from({ length: count }, (_, i) => (
                <span key={i} className={i === index ? 'on' : ''} />
              ))}
            </div>
          )}
        </div>
      </div>
      {full && (
        <div className="ot-fs" ref={fsRef} role="dialog" aria-modal="true" aria-label={`${name} image viewer`} tabIndex={-1} data-no-capture>
          <div className="ot-fs-bar">
            <p>
              {name} · {index + 1} / {count}
            </p>
            <button type="button" data-autofocus aria-label="Close image viewer" onClick={() => setFull(false)}>
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="ot-fs-stage">
            {drawn ? <Art id={p.id} emoji={p.emoji} name={name} image={p.image} view={index} sizes="100vw" /> : <Img src={photos[index]} alt={`${name}, image ${index + 1}`} fill sizes="100vw" className="ot-contain" />}
            {count > 1 && (
              <>
                <button type="button" className="ot-fs-nav l" aria-label="Previous image" onClick={() => go(index - 1)}>
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button type="button" className="ot-fs-nav r" aria-label="Next image" onClick={() => go(index + 1)}>
                  <ChevronRight aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- buying controls ---------- */

function Qty({ value, onChange, max = MAX_QTY, label = 'Quantity' }: { value: number; onChange: (n: number) => void; max?: number; label?: string }) {
  return (
    <div className="ot-qty" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus aria-hidden="true" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} title={value >= max ? `Max ${max} per order` : undefined} onClick={() => onChange(value + 1)}>
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}

function AddButton({ onAdd, className = '' }: { onAdd: () => void; className?: string }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);
  return (
    <button
      type="button"
      className={`ot-btn ${className}`}
      onClick={() => {
        onAdd();
        setAdded(true);
      }}
    >
      <span key={added ? 'a' : 'i'}>
        {added ? <Check aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />} {added ? 'Added' : 'Add to cart'}
      </span>
    </button>
  );
}

function businessDate(days: number) {
  const d = new Date();
  let n = 0;
  while (n < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) n++; // no Sunday deliveries
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Delivery({ freeShipAt }: { freeShipAt: number }) {
  const [pin, setPin] = useState('');
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const check = () => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setRes({ ok: false, text: 'Enter a valid 6-digit pincode.' });
    setRes({ ok: true, text: `Estimated delivery: 3–5 business days (${businessDate(3)} – ${businessDate(5)})` });
  };
  return (
    <div className="ot-deliver">
      <p className="ot-dl-h">
        <Truck aria-hidden="true" /> Deliver to
      </p>
      <div className="pin">
        <span className="ot-pin-f">
          <MapPin aria-hidden="true" />
          <input
            value={pin}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Enter pincode"
            aria-label="Delivery pincode"
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setRes(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </span>
        <button type="button" className="ot-btn out sm" onClick={check}>
          Check
        </button>
      </div>
      <div className="ot-dl-r" aria-live="polite" role="status">
        {res ? (
          <p className={res.ok ? 'ok' : 'bad'}>
            {res.ok ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />} {res.text}
          </p>
        ) : (
          <p className="muted">Free delivery on orders above {inr(freeShipAt)}. Delivery estimates are indicative.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- the page ---------- */

export function OtProductView({ id }: { id: string }) {
  const { product } = useCatalog();
  const p = product(id);
  const name = useProductName(p?.id ?? '', p?.name ?? '');
  useDocumentTitle(p ? name : 'Product not found');
  if (!p) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧭" title="Product not found" page text="It may belong to another template, or it is no longer in the catalogue." action={{ label: 'Browse all products', href: '/shop' }} />
      </div>
    );
  }
  return <Detail key={p.id} p={p} />;
}

const ASSURE = [
  { icon: Truck, title: 'Free delivery', text: (n: number) => `on orders above ${inr(n)}` },
  { icon: RotateCcw, title: 'Easy returns', text: () => '7 days, hassle free' },
  { icon: ShieldCheck, title: 'Secure payments', text: () => 'Safe checkout with Devduo Pay' },
];
const HIGHLIGHTS = [
  { icon: Leaf, text: 'Natural ingredients' },
  { icon: PackageCheck, text: 'Packed with care' },
  { icon: Sparkles, text: 'Quality focused' },
  { icon: Headset, text: 'Help when you need it' },
];

function Detail({ p }: { p: Product }) {
  const { products, category, template, freeShipAt } = useCatalog();
  const router = useRouter();
  const [opt, setOpt] = useState(0);
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const [sticky, setSticky] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const add = useCartStore((s) => s.add);
  const wished = useWishlistStore((s) => s.ids.includes(p.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const toast = useUiStore((s) => s.showToast);
  const openCart = useUiStore((s) => s.openCart);
  const name = useProductName(p.id, p.name);
  const desc = useText(productDescId(p.id), p.desc);
  const c = category(p.cat);
  const price = unitPrice(p, opt);
  const mrp = unitMrp(p, opt);
  const off = pct(price, mrp);
  const label = p.opts?.values[opt] ?? p.weight;

  // The sticky purchase bar (phones and tablets) shows once the main buttons scroll out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting), { rootMargin: '0px 0px -8px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addNow = () => {
    add(p.id, opt, qty);
    openCart();
  };
  const buyNow = () => {
    add(p.id, opt, qty);
    router.push('/checkout');
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) return void (await navigator.share({ title: name, url }));
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard');
    } catch {
      // dismissed, or the clipboard is blocked: nothing to report
    }
  };

  const more = useMemo(() => {
    const same = products.filter((q) => q.cat === p.cat && q.id !== p.id);
    return [...same, ...products.filter((q) => q.cat !== p.cat && q.id !== p.id)].slice(0, 10);
  }, [products, p]);

  return (
    <div className="wrap page ot-pdp">
      <Crumbs trail={[{ label: 'All products', href: '/shop' }, ...(c ? [{ label: c.name, href: `/category/${c.slug}` }] : []), { label: name }]} />
      <div className="ot-pg">
        <div className="ot-pg-gal">
          <Gallery p={p} name={name} index={view} onIndex={setView} />
        </div>

        <div className="ot-info">
          <div className="ot-badges">
            {p.tag && <span className="ot-tag">{p.tag}</span>}
            {c && (
              <Link href={`/category/${c.slug}`} className="ot-cat">
                {c.name}
              </Link>
            )}
          </div>
          <Txt as="h1" id={productNameId(p.id)} text={p.name} />
          <div className="ot-rate-row">
            <OtRating rating={p.rating} count={p.rev} size={16} />
            <a href="#reviews">Read reviews</a>
          </div>
          <p className="ot-short">{p.short ?? p.desc}</p>

          <div className="ot-pricing">
            <b>{inr(price)}</b>
            {mrp > price && (
              <s>
                <span className="sr-only">MRP </span>
                {inr(mrp)}
              </s>
            )}
            {off > 0 && <em>{off}% off</em>}
          </div>
          <p className="ot-tax">Inclusive of all taxes</p>

          {p.opts && (
            <fieldset className="ot-packs">
              <legend>{p.opts.label}</legend>
              <div role="radiogroup" aria-label={`Select ${p.opts.label.toLowerCase()}`}>
                {p.opts.values.map((v, i) => (
                  <button key={v} type="button" role="radio" aria-checked={i === opt} className={i === opt ? 'on' : ''} onClick={() => setOpt(i)}>
                    <b>{v}</b>
                    <span>{inr(unitPrice(p, i))}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div ref={ctaRef} className="ot-buy">
            <div className="ot-buy-q">
              <Qty value={qty} onChange={(n) => setQty(Math.max(1, Math.min(n, MAX_QTY)))} />
              <span className="ot-stock">
                <i aria-hidden="true" /> In stock
              </span>
            </div>
            <div className="ot-buy-b">
              <AddButton onAdd={addNow} className="lg" />
              <button type="button" className="ot-btn out lg" onClick={buyNow}>
                <Zap aria-hidden="true" /> Buy now
              </button>
            </div>
          </div>

          <ul className="ot-assure">
            {ASSURE.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon aria-hidden="true" strokeWidth={1.6} />
                <span>
                  <b>{title}</b>
                  {text(freeShipAt)}
                </span>
              </li>
            ))}
          </ul>
          {label && <p className="ot-meta">Net qty: {label}</p>}
        </div>

        <aside aria-label="Delivery and highlights" className="ot-aside">
          <div className="ot-aside-card">
            <Delivery freeShipAt={freeShipAt} />
            <ul className="ot-hl">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span>
                    <Icon aria-hidden="true" strokeWidth={1.7} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="ot-aside-btns">
            <button type="button" className="ot-btn out sm" onClick={share}>
              <Share2 aria-hidden="true" /> Share
            </button>
            <button
              type="button"
              className="ot-btn out sm"
              aria-pressed={wished}
              onClick={() => {
                const added = toggleWish(p.id);
                toast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? { label: 'View wishlist', href: '/wishlist' } : undefined);
              }}
            >
              <Heart aria-hidden="true" className={wished ? 'fill' : ''} /> {wished ? 'Wishlisted' : 'Add to wishlist'}
            </button>
          </div>
        </aside>
      </div>

      <Ingredients p={p} />
      <Information p={p} desc={desc} category={c?.name ?? ''} />
      <HowTo p={p} />
      <Reviews p={p} name={name} />
      {more.length > 0 && (
        <Reveal className="ot-rail ot-similar">
          <OtCarousel id="similar" title="Similar products" link="See more products" go={c ? `category/${c.slug}` : 'shop'} contained={false}>
            {more.map((q) => (
              <OtCard key={q.id} product={q} />
            ))}
          </OtCarousel>
        </Reveal>
      )}

      <div className={`ot-sticky${sticky ? ' on' : ''}`} data-no-capture {...(sticky ? {} : ({ inert: '' } as object))}>
        <div>
          <small>{label ?? 'Price'}</small>
          <b>{inr(price)}</b>
        </div>
        <AddButton onAdd={addNow} />
        <button type="button" className="ot-btn out" onClick={buyNow}>
          Buy now
        </button>
      </div>
      <span className="sr-only" data-template={template.id} />
    </div>
  );
}

/* ---------- lower sections ---------- */

function Ingredients({ p }: { p: Product }) {
  const { template } = useCatalog();
  if (!p.ingredients?.length) return null;
  const lib = template.ingredientInfo ?? [];
  const find = (n: string) => lib.find((i) => n.toLowerCase().includes(i.name.toLowerCase()));
  return (
    <section aria-labelledby="ot-ing-h" className="ot-lower">
      <Reveal>
        <h2 id="ot-ing-h">Key ingredients</h2>
      </Reveal>
      <ul className="ot-ings">
        {p.ingredients.map((n, i) => {
          const m = find(n);
          return (
            <li key={n}>
              <Reveal delay={(i % 3) * 0.07} y={12} className="ot-ing-wrap">
                <div className="ot-ing">
                  <span className="ot-ing-img">
                    {m ? (
                      <Img src={m.image} alt="" fill sizes="112px" className="ot-cover" />
                    ) : (
                      <span aria-hidden="true">
                        <Leaf strokeWidth={1.2} />
                      </span>
                    )}
                  </span>
                  <span>
                    <b>{n}</b>
                    {m && <small>{m.text}</small>}
                  </span>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Information({ p, desc, category }: { p: Product; desc: string; category: string }) {
  const rows: [string, string][] = [
    ['Product name', p.name],
    ['Category', category],
    ['Description', desc],
    ['Net quantity', p.opts ? p.opts.values.join(', ') : (p.weight ?? '—')],
    ...(p.ingredients?.length ? ([['Ingredients', `${p.ingredients.join(', ')}.`]] as [string, string][]) : []),
    ...(p.usage ? ([['Usage', p.usage]] as [string, string][]) : []),
    ['Storage', p.storage ?? 'Store in a cool, dry place away from direct sunlight.'],
    ...(p.d ? ([['Highlights', p.d.split('|').filter(Boolean).join(' · ')]] as [string, string][]) : []),
  ];
  return (
    <section aria-labelledby="ot-info-h" className="ot-lower">
      <Reveal>
        <h2 id="ot-info-h">Product information</h2>
        <dl className="ot-table">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="ot-fine">
          This product is not intended to diagnose, treat, cure or prevent any disease. Individual results may vary. Please read the label, do a patch test where relevant, and consult a qualified professional if you have a medical condition, are pregnant or nursing.
        </p>
      </Reveal>
    </section>
  );
}

function HowTo({ p }: { p: Product }) {
  const steps = [
    { title: 'Prepare', text: 'Read the label and any directions that come with your product.' },
    { title: 'Use as directed', text: p.usage ?? 'Follow the directions on the pack.' },
    { title: 'Stay consistent', text: 'Follow the product instructions consistently for the best experience.' },
    { title: 'Store with care', text: p.storage ?? 'Store as directed on the pack.' },
  ];
  return (
    <section aria-labelledby="ot-use-h" className="ot-lower">
      <Reveal>
        <h2 id="ot-use-h">How to use</h2>
      </Reveal>
      <ol className="ot-steps">
        {steps.map((s, i) => (
          <li key={s.title}>
            {i < steps.length - 1 && <span className="ot-step-line" aria-hidden="true" />}
            <Reveal delay={i * 0.1} y={14} className="ot-step-wrap">
              <span className="ot-step-n">{i + 1}</span>
              <div className="ot-step">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

const NAMES = ['Anjali R', 'Karthik M', 'Divya S', 'Imran K', 'Meena P', 'Suresh V', 'Lakshmi N', 'Arjun T'];
const TITLES = ['Exactly as described', 'Better than expected', 'Quick delivery', 'A lovely gift', 'Good value', 'Happy with it'];
const TEXTS = [
  'Exactly as described and packed with care.',
  'Quality is better than I expected for the price.',
  'Delivery was quick and I will order again.',
  'Gifted this to family and they loved it.',
  'Good value for money.',
  'Using it for two weeks and very happy.',
];

function Reviews({ p, name }: { p: Product; name: string }) {
  const h = hash(p.id);
  // Spread of ratings that adds up to the product's average, so the bars and the headline agree.
  const dist = useMemo(() => {
    const hi = Math.max(0, Math.min(1, (p.rating - 3) / 2));
    const five = 40 + hi * 40;
    const four = 30 - hi * 12;
    const three = 15 - hi * 9;
    const two = 8 - hi * 6;
    const one = 100 - five - four - three - two;
    return [five, four, three, two, one].map((v) => Math.round(v));
  }, [p.rating]);
  return (
    <section id="reviews" aria-labelledby="ot-rev-h" className="ot-lower ot-reviews-sec">
      <Reveal>
        <h2 id="ot-rev-h">Customer reviews</h2>
      </Reveal>
      <div className="ot-rv-grid">
        <div className="ot-rv-sum">
          <p className="ot-rv-big">
            <b>{p.rating.toFixed(1)}</b>
            <span>out of 5</span>
          </p>
          <OtStars value={p.rating} size={20} />
          <p className="ot-rv-n">
            Based on {p.rev.toLocaleString('en-IN')} review{p.rev === 1 ? '' : 's'}
          </p>
          <ul aria-label="Rating breakdown">
            {dist.map((v, i) => (
              <li key={i}>
                <span>{5 - i} star</span>
                <i aria-hidden="true">
                  <u style={{ width: `${Math.max(0, v)}%` }} />
                </i>
                <span>{Math.max(0, v)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="ot-rv-list">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <article>
                <div className="ot-rv-top">
                  <OtStars value={i === 2 ? 4 : 5} size={15} />
                  <span className="sr-only">Rated {i === 2 ? 4 : 5} out of 5</span>
                </div>
                <h3>{TITLES[(h + i * 2) % 6]}</h3>
                <p>{TEXTS[(h + i * 5) % 6]}</p>
                <footer>
                  <b>{NAMES[(h + i * 3) % 8]}</b>
                  <span className="ot-ver">
                    <BadgeCheck aria-hidden="true" /> Verified purchase
                  </span>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <p className="ot-note">Sample reviews for the demo of {name}. A live store would show real customer reviews.</p>
    </section>
  );
}
