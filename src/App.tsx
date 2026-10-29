import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/Providers';
import {
  CartPage, CategoryPage, CheckoutPage, HomePage, NotFoundPage, OrdersPage, ProductPage,
  SearchPage, ShopPage, SuccessPage, WishlistPage,
} from '@/pages';

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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success/:orderId" element={<SuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
