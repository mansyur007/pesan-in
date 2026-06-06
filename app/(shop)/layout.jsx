'use client';

import { CartProvider } from '@/components/buyer/CartProvider';

export default function ShopLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
