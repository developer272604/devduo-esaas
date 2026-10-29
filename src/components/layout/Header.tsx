import { useEffect, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { usePathname } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { useCartStore, cartCount } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { Icon } from '@/components/common/Icon';
import { Txt } from '@/components/demo/Txt';
import { SearchBox } from './SearchBox';

const NAV_LIMIT = 3;

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="announce">
      <Txt id="brand.announce" text={text} />
    </div>
  );
}

export function Header() {
  const { template } = useCatalog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);
  const count = useCartStore((s) => cartCount(s.lines));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const openModal = useUiStore((s) => s.openModal);
  const toast = useUiStore((s) => s.showToast);

  useEffect(() => {
    setMobileOpen(false);
    setAcctOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!acctOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!acctRef.current?.contains(e.target as Node)) setAcctOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAcctOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [acctOpen]);

  const links = template.cats.slice(0, NAV_LIMIT);
  const isOn = (href: string) => pathname === href;

  return (
    <header id="site-header" className={mobileOpen ? 'mo' : ''}>
      <AnnouncementBar text={template.announce} />
      <div className="wrap bar">
        <button type="button" className="icon only-m" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
          <Icon name={mobileOpen ? 'x' : 'menu'} />
        </button>
        <Link className="logo" href="/" aria-label={`${template.name} home`}>
          <span className="le" aria-hidden="true">
            {template.logo}
          </span>
          <Txt id="brand.name" text={template.name} />
        </Link>
        <nav className="links" aria-label="Main">
          {links.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className={isOn(`/category/${c.slug}`) ? 'on' : ''}>
              {c.name}
            </Link>
          ))}
          <Link href="/shop" className={isOn('/shop') ? 'on' : ''}>
            All products
          </Link>
        </nav>
        <SearchBox />
        <div className="acts">
          <div className="acct" ref={acctRef}>
            <button type="button" className="icon" aria-label="Account" aria-haspopup="menu" aria-expanded={acctOpen} onClick={() => setAcctOpen((o) => !o)}>
              {user ? <b>{(String(user.name ?? '').trim()[0] || 'U').toUpperCase()}</b> : <Icon name="user" />}
            </button>
            {acctOpen && (
              <div className="menu" role="menu">
                {user ? (
                  <>
                    <div className="who">
                      {user.name}
                      <br />+91 {user.phone}
                    </div>
                    <Link href="/orders" role="menuitem">My orders</Link>
                    <Link href="/wishlist" role="menuitem">Wishlist</Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        signOut();
                        setAcctOpen(false);
                        toast('Signed out');
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAcctOpen(false);
                        openModal({ t: 'auth' });
                      }}
                    >
                      Sign in
                    </button>
                    <Link href="/orders" role="menuitem">My orders</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link className="icon" href="/wishlist" aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? '' : 's'}`}>
            <Icon name="heart" />
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </Link>
          <Link className="icon" href="/cart" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            <Icon name="bag" />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
      </div>
      <nav className="mnav" aria-label="Mobile">
        {template.cats.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`}>
            {c.name}
          </Link>
        ))}
        <Link href="/shop">All products</Link>
        <Link href="/orders">My orders</Link>
      </nav>
    </header>
  );
}
