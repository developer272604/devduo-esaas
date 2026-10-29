import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { Txt, useText } from '@/components/demo/Txt';
import { useUiStore } from '@/store/ui';
import { OtFooter } from '@/components/herbal/Chrome';
import { BrandLogo } from '@/components/common/BrandLogo';

export function Footer() {
  const { template } = useCatalog();
  const brand = useText('brand.name', template.name);
  const openCart = useUiStore((s) => s.openCart);
  if (template.chrome === 'ooty') return <OtFooter />;
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fg">
          <div>
            <Link className="logo" href="/">
              <BrandLogo><span className="le" aria-hidden="true">{template.logo}</span></BrandLogo>
              <Txt id="brand.name" text={template.name} />
            </Link>
            <Txt as="p" id="brand.foot" text={template.foot} />
          </div>
          <div>
            <h2 className="fh">Shop</h2>
            <ul>
              {template.cats.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="fh">Help</h2>
            <ul>
              <li><Link href="/orders">Track an order</Link></li>
              <li><button type="button" className="linkbtn" onClick={openCart}>Your cart</button></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
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
        <div className="fb">
          <span>© {new Date().getFullYear()} {brand}. Demo store, no real orders.</span>
          <span>Built on Devduo ESaas</span>
          <div className="chips2">
            <span>UPI</span>
            <span>Cards</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
