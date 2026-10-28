import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';

export function Footer() {
  const { template } = useCatalog();
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fg">
          <div>
            <Link className="logo" href="/">
              <span className="le" aria-hidden="true">{template.logo}</span>
              <span>{template.name}</span>
            </Link>
            <p>{template.foot}</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              {template.cats.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><Link href="/orders">Track an order</Link></li>
              <li><Link href="/cart">Your cart</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li>7-day easy returns</li>
            </ul>
          </div>
          <div>
            <h4>Pay and talk</h4>
            <ul>
              <li>UPI, cards and cash on delivery</li>
              <li>Order updates on WhatsApp</li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span>© 2026 {template.name}. Demo store, no real orders.</span>
          <span>Built on Vilva D2C</span>
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
