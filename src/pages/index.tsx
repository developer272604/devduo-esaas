import { useParams, useSearchParams } from 'react-router-dom';
import { HomeSections } from '@/components/sections';
import { CategoryView, SearchView, ShopView } from '@/components/views/ListViews';
import { ProductView } from '@/components/views/ProductView';
import { WishlistView } from '@/components/views/Wishlist';
import { CartView } from '@/components/views/CartView';
import { CheckoutView } from '@/components/views/CheckoutView';
import { SuccessView } from '@/components/views/SuccessView';
import { OrdersView } from '@/components/views/OrdersView';
import { EmptyState } from '@/components/common/bits';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export const HomePage = () => {
  useDocumentTitle();
  return <HomeSections />;
};
export const ShopPage = () => <ShopView />;
export const CategoryPage = () => <CategoryView slug={useParams().slug ?? ''} />;
export const SearchPage = () => <SearchView q={useSearchParams()[0].get('q') ?? ''} />;
export const ProductPage = () => <ProductView id={useParams().id ?? ''} />;
export const WishlistPage = () => <WishlistView />;
export const CartPage = () => <CartView />;
export const CheckoutPage = () => <CheckoutView />;
export const SuccessPage = () => <SuccessView orderId={useParams().orderId ?? ''} />;
export const OrdersPage = () => <OrdersView />;

export const NotFoundPage = () => {
  useDocumentTitle('Page not found');
  return (
    <div className="wrap page">
      <EmptyState emoji="🧭" title="Page not found" page text="That page does not exist in this store." action={{ label: 'Back to home', href: '/' }} />
    </div>
  );
};
