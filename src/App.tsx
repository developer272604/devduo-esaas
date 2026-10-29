import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUiStore } from '@/store/ui';
import { AppShell } from '@/components/Providers';
import {
  CategoryPage, CheckoutPage, HomePage, NotFoundPage, OrdersPage, ProductPage,
  SearchPage, ShopPage, SuccessPage, WishlistPage,
} from '@/pages';

/** The cart is a drawer, not a page. The old /cart address opens it over the home page. */
function CartRoute() {
  const openCart = useUiStore((s) => s.openCart);
  useEffect(() => openCart(), [openCart]);
  return <Navigate to="/" replace state={{ cart: true }} />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartRoute />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success/:orderId" element={<SuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
