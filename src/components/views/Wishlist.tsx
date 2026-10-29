import { useCatalog } from '@/lib/hooks';
import { useWishlistStore } from '@/store/wishlist';
import { ProductGrid } from '@/components/common/ProductCard';
import { Crumbs, EmptyState } from '@/components/common/bits';
import { Txt } from '@/components/demo/Txt';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export function WishlistView() {
  const { product } = useCatalog();
  useDocumentTitle('Wishlist');
  const ids = useWishlistStore((s) => s.ids);
  const list = ids.flatMap((i) => product(i) ?? []);
  return (
    <div className="wrap page">
      <Crumbs trail={[{ label: 'Wishlist' }]} />
      <div className="ph">
        <h1>
          <Txt id="page.wishlist.title" text="Your wishlist" />
        </h1>
      </div>
      {list.length ? (
        <ProductGrid products={list} level={2} />
      ) : (
        <EmptyState emoji="💛" title="Nothing saved yet" text="Tap the heart on any product to save it here." action={{ label: 'Browse products', href: '/shop' }} />
      )}
    </div>
  );
}
