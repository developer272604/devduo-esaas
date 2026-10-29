import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, Leaf, Menu, Search, ShoppingBag, X } from 'lucide-react';
import Link from '@/components/common/Link';
import { Art } from '@/components/common/Art';
import { Txt } from '@/components/demo/Txt';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { SearchBox } from '@/components/layout/SearchBox';
import { useCatalog } from '@/lib/hooks';
import { usePathname } from '@/lib/nav';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { cartCount, useCartStore } from '@/store/cart';
import { useUiStore } from '@/store/ui';
import { useWishlistStore } from '@/store/wishlist';
import { FallingLeaves, OtLogo } from './bits';

const WORDS = ['Natural ingredients', 'Inspired by the Nilgiris', 'Energy honey', 'Made with care', 'Ooty varkey', 'Herbal teas', 'Everyday wellness', 'Herbal oils'];

function Row({ announce, hidden }: { announce: string; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="ot-marquee-row">
      <li>
        {hidden ? announce : <Txt id="brand.announce" text={announce} />}
        <Leaf aria-hidden="true" />
      </li>
      {WORDS.map((w) => (
        <li key={w}>
          {w}
          <Leaf aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}

/** Slim scrolling band above the header. Pauses on hover; still when reduced motion is preferred. */
function Marquee({ announce }: { announce: string }) {
  return (
    <div className="announce ot-marquee">
      <div>
        <Row announce={announce} />
        <Row announce={announce} hidden />
      </div>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return n > 0 ? <span className="badge">{n > 99 ? '99+' : n}</span> : null;
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { template } = useCatalog();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  const inert = open ? {} : ({ inert: '' } as object);
  return (
    <>
      <div className={`overlay ot-mo-overlay${open ? ' on' : ''}`} data-no-capture onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={`ot-mo${open ? ' on' : ''}`} data-no-capture role="dialog" aria-modal={open} aria-label="Menu" tabIndex={-1} {...inert}>
        <div className="ot-mo-head">
          <OtLogo />
          <button type="button" className="icon" aria-label="Close menu" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul>
            <li>
              <Link href="/" onClick={onClose}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" onClick={onClose}>
                All products
              </Link>
            </li>
            {template.cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} onClick={onClose}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/wishlist" onClick={onClose}>
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/orders" onClick={onClose}>
                My orders
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

/** "All categories": a grid of the template's categories with their pictures. */
function CategoriesMenu({ pathname }: { pathname: string }) {
  const { template } = useCatalog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="ot-cm" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-controls="ot-cm-list" onClick={() => setOpen((v) => !v)}>
        <Menu aria-hidden="true" className="m" /> All categories <ChevronDown aria-hidden="true" className={open ? 'up' : ''} />
      </button>
      {open && (
        <ul id="ot-cm-list">
          {template.cats.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`}>
                <span className="ot-cm-img">
                  {c.image ? <Art id={`cat-${c.slug}`} name="" image={c.image} kind="box" sizes="48px" /> : <span aria-hidden="true">{c.emoji}</span>}
                </span>
                <span>
                  <b>{c.name}</b>
                  <small>{c.blurb}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The Ooty Herbals header: scrolling band, logo, search pill, account / wishlist / cart, and a category bar. */
export function OtHeader() {
  const { template } = useCatalog();
  const pathname = usePathname();
  const count = useCartStore((s) => cartCount(s.lines));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const openCart = useUiStore((s) => s.openCart);
  const cartOpen = useUiStore((s) => s.cartOpen);
  const [menu, setMenu] = useState(false);
  const [find, setFind] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenu(false);
    setFind(false);
  }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const isOn = (href: string) => pathname === href;
  const cartBtn = (
    <button type="button" className="icon" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`} aria-haspopup="dialog" aria-expanded={cartOpen} onClick={openCart}>
      <ShoppingBag aria-hidden="true" />
      <Count n={count} />
    </button>
  );

  return (
    <header id="site-header" className={`ot-header${scrolled ? ' sc' : ''}`}>
      <Marquee announce={template.announce} />
      <div className="wrap ot-bar">
        <button type="button" className="icon ot-menu-btn" aria-label="Open menu" aria-haspopup="dialog" onClick={() => setMenu(true)}>
          <Menu aria-hidden="true" />
        </button>
        <OtLogo />
        <div className="ot-find">
          <SearchBox pill />
        </div>
        <div className="ot-acts">
          <button type="button" className="icon ot-find-btn" aria-label="Search" aria-expanded={find} onClick={() => setFind((v) => !v)}>
            <Search aria-hidden="true" />
          </button>
          <AccountMenu variant="ooty" />
          <Link className="icon ot-wish" href="/wishlist" aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? '' : 's'}`}>
            <Heart aria-hidden="true" />
            <Count n={wishCount} />
          </Link>
          {cartBtn}
        </div>
      </div>
      {find && (
        <div className="wrap ot-find-m">
          <SearchBox pill />
        </div>
      )}
      <nav className="links ot-sub" aria-label="Primary">
        <div className="wrap">
          <CategoriesMenu pathname={pathname} />
          <ul>
            <li>
              <Link href="/shop" className={isOn('/shop') ? 'on' : ''} aria-current={isOn('/shop') ? 'page' : undefined}>
                All products
              </Link>
            </li>
            {template.cats.map((c) => {
              const href = `/category/${c.slug}`;
              return (
                <li key={c.slug}>
                  <Link href={href} className={isOn(href) ? 'on' : ''} aria-current={isOn(href) ? 'page' : undefined}>
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <MobileDrawer open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

const PAY = ['UPI', 'Cards', 'COD'];

/** The Ooty Herbals footer: deep green, drifting leaves, link columns and payment chips. */
export function OtFooter() {
  const { template } = useCatalog();
  const openCart = useUiStore((s) => s.openCart);
  return (
    <footer className="foot ot-foot">
      <div className="ot-foot-glow" aria-hidden="true" />
      <FallingLeaves count={6} />
      <div className="wrap ot-foot-in">
        <div className="ot-foot-grid">
          <div className="ot-foot-brand">
            <OtLogo tone="light" />
            <Txt as="p" id="brand.foot" text={template.foot} />
          </div>
          <div className="ot-foot-cols">
            <div>
              <h2 className="fh">Shop</h2>
              <ul>
                <li>
                  <Link href="/shop">All products</Link>
                </li>
                {template.cats.slice(0, 5).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="fh">Help</h2>
              <ul>
                <li>
                  <Link href="/orders">Track an order</Link>
                </li>
                <li>
                  <button type="button" className="linkbtn" onClick={openCart}>
                    Your cart
                  </button>
                </li>
                <li>
                  <Link href="/wishlist">Wishlist</Link>
                </li>
                <li>7-day easy returns</li>
              </ul>
            </div>
            <div>
              <h2 className="fh">Pay and talk</h2>
              <ul>
                <li>UPI, cards and cash on delivery</li>
                <li>Order updates on WhatsApp</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="ot-foot-base">
          <p>
            © {new Date().getFullYear()} <Txt id="brand.name" text={template.name} />. Demo store, no real orders. Built on Devduo ESaas
          </p>
          <ul aria-label="Payment options">
            {PAY.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <p className="ot-foot-note">Statements on this site are not medical advice. Our products are not intended to diagnose, treat, cure or prevent any disease.</p>
      </div>
    </footer>
  );
}
