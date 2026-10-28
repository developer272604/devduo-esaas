import Link from '@/components/common/Link';
import { pct } from '@/lib/format';
import { fromPrice } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useUiStore } from '@/store/ui';
import { Art } from './Art';
import { Icon } from './Icon';
import { Price, Stars } from './bits';

export function ProductCard({ product: p, sizes }: { product: Product; sizes?: string }) {
  const wished = useWishlistStore((s) => s.ids.includes(p.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const add = useCartStore((s) => s.add);
  const toast = useUiStore((s) => s.showToast);
  const { price, mrp, from } = fromPrice(p);
  const off = pct(price, mrp);
  const badge = p.tag ?? (off >= 20 ? `${off}% off` : '');

  return (
    <article className="card">
      <button
        type="button"
        className={`heart${wished ? ' on' : ''}`}
        aria-label={`${wished ? 'Remove from' : 'Add to'} wishlist: ${p.name}`}
        aria-pressed={wished}
        onClick={() => {
          const added = toggle(p.id);
          if (added) toast('Saved to wishlist', { label: 'View wishlist', href: '/wishlist' });
          else toast('Removed from wishlist');
        }}
      >
        <Icon name="heart" size={18} filled={wished} />
      </button>
      {badge && <span className="tagb">{badge}</span>}
      <Link href={`/product/${p.id}`} aria-label={p.name} tabIndex={-1}>
        <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} sizes={sizes} />
      </Link>
      <div className="body">
        <h3>
          <Link href={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        <div className="rating">
          <Stars rating={p.rating} /> <span className="rc">({p.rev.toLocaleString('en-IN')})</span>
        </div>
        <Price price={price} mrp={mrp} from={from} />
        {p.opts ? (
          <Link className="btn ghost sm" href={`/product/${p.id}`}>
            Choose {p.opts.label.toLowerCase()}
          </Link>
        ) : (
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              add(p.id, 0, 1);
              toast('Added to cart', { label: 'View cart', href: '/cart' });
            }}
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, cols }: { products: Product[]; cols?: 2 | 4 | 6 }) {
  return (
    <div className={`grid${cols ? ` cols-${cols}` : ''}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} sizes={cols === 6 ? '(max-width: 700px) 50vw, 17vw' : undefined} />
      ))}
    </div>
  );
}
