import { useCatalog } from '@/lib/hooks';
import { useWishlistStore } from '@/store/wishlist';
import { ProductGrid } from '@/components/common/ProductCard';
import { Crumbs, EmptyState } from '@/components/common/bits';

export function WishlistView() {
  const { product } = useCatalog();
  const ids = useWishlistStore((s) => s.ids);
  const list = ids.flatMap((i) => product(i) ?? []);
  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'Wishlist' }]} />
      <div className="ph">
        <h1>Your wishlist</h1>
      </div>
      {list.length ? (
        <ProductGrid products={list} />
      ) : (
        <EmptyState emoji="💛" title="Nothing saved yet" text="Tap the heart on any product to save it here." action={{ label: 'Browse products', href: '/shop' }} />
      )}
    </div>
  );
}
