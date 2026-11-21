'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useDataManager } from '@/lib/storage';
import type { CartLine, Product } from '@/lib/storage/types';

const CART_KEY = 'pos_cart_session';

interface StoredLine {
  productId: number;
  quantity: number;
}

interface CartContextType {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** Adds one unit; returns an error message if stock is insufficient. */
  add: (product: Product) => string | null;
  /** Sets an exact quantity (clamped to stock); 0 removes the line. Returns an error message when clamped. */
  setQuantity: (productId: number, quantity: number) => string | null;
  remove: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, ready } = useDataManager();
  const [stored, setStored] = useState<StoredLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Restore the in-progress cart after a refresh
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CART_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from sessionStorage after mount
      if (raw) setStored(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  }, [stored, loaded]);

  // Always resolve lines against live product data so price/stock are current
  const lines = useMemo<CartLine[]>(() => {
    if (!ready) return [];
    return stored
      .map(s => {
        const product = products.find(p => p.id === s.productId);
        return product ? { product, quantity: s.quantity } : null;
      })
      .filter((l): l is CartLine => l !== null);
  }, [stored, products, ready]);

  const add = useCallback(
    (product: Product) => {
      if (product.quantity <= 0) return `${product.name} is out of stock`;
      const existing = stored.find(s => s.productId === product.id);
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > product.quantity) return `Only ${product.quantity} × ${product.name} in stock`;
      setStored(prev =>
        existing
          ? prev.map(s => (s.productId === product.id ? { ...s, quantity: nextQty } : s))
          : [...prev, { productId: product.id, quantity: 1 }]
      );
      return null;
    },
    [stored]
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      const product = products.find(p => p.id === productId);
      if (!product || quantity <= 0) {
        setStored(prev => prev.filter(s => s.productId !== productId));
        return null;
      }
      const clamped = Math.min(Math.floor(quantity), product.quantity);
      setStored(prev => prev.map(s => (s.productId === productId ? { ...s, quantity: clamped } : s)));
      return clamped < quantity ? `Only ${product.quantity} × ${product.name} in stock` : null;
    },
    [products]
  );

  const remove = useCallback((productId: number) => {
    setStored(prev => prev.filter(s => s.productId !== productId));
  }, []);

  const clear = useCallback(() => setStored([]), []);

  const subtotal = useMemo(
    () => Math.round(lines.reduce((s, l) => s + l.product.price * l.quantity, 0) * 100) / 100,
    [lines]
  );
  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, itemCount, subtotal, add, setQuantity, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
