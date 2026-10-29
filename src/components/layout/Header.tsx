import { useEffect, useState } from 'react';
import Link from '@/components/common/Link';
import { usePathname } from '@/lib/nav';
import { useCatalog } from '@/lib/hooks';
import { useCartStore, cartCount } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import { Icon } from '@/components/common/Icon';
import { Txt } from '@/components/demo/Txt';
import { SearchBox } from './SearchBox';
import { AccountMenu } from './AccountMenu';
import { OtHeader } from '@/components/herbal/Chrome';

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
  return template.chrome === 'ooty' ? <OtHeader /> : <DefaultHeader />;
}

function DefaultHeader() {
  const { template } = useCatalog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((s) => cartCount(s.lines));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const openCart = useUiStore((s) => s.openCart);
  const cartOpen = useUiStore((s) => s.cartOpen);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
          <AccountMenu />
          <Link className="icon" href="/wishlist" aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? '' : 's'}`}>
            <Icon name="heart" />
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </Link>
          <button type="button" className="icon" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`} aria-haspopup="dialog" aria-expanded={cartOpen} onClick={openCart}>
            <Icon name="bag" />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
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
