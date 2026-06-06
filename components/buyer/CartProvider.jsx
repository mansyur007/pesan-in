'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const STORAGE_KEY = 'pesanin_cart';
const EMPTY = { merchant: null, items: {} };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  // Hydrate dari localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  function addItem(merchant, item) {
    setCart((c) => {
      const switching = c.merchant && c.merchant.id !== merchant.id;
      const base = switching ? { merchant, items: {} } : { merchant, items: { ...c.items } };
      const prev = base.items[item.id];
      base.items[item.id] = {
        name: item.name,
        price: item.price,
        qty: (prev?.qty || 0) + 1,
      };
      return base;
    });
  }

  function decItem(id) {
    setCart((c) => {
      const items = { ...c.items };
      if (!items[id]) return c;
      const qty = items[id].qty - 1;
      if (qty <= 0) delete items[id];
      else items[id] = { ...items[id], qty };
      const merchant = Object.keys(items).length ? c.merchant : null;
      return { merchant, items };
    });
  }

  function clearCart() {
    setCart(EMPTY);
  }

  const lines = () =>
    Object.entries(cart.items).map(([id, v]) => ({
      id,
      name: v.name,
      price: v.price,
      qty: v.qty,
      lineTotal: v.price * v.qty,
    }));
  const count = () => Object.values(cart.items).reduce((a, v) => a + v.qty, 0);
  const subtotal = () => lines().reduce((a, l) => a + l.lineTotal, 0);
  const qtyOf = (id) => cart.items[id]?.qty || 0;

  const value = { cart, ready, addItem, decItem, clearCart, lines, count, subtotal, qtyOf };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
