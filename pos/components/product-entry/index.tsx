'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Search, Minus, Plus, ShoppingCart, PackagePlus, ScanLine } from 'lucide-react';
import Card from '@/components/card';
import Button from '@/components/button';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import { useCart } from '@/app/(app)/cart-context';
import type { Product } from '@/lib/storage/types';

export default function ProductEntry() {
  const router = useRouter();
  const money = useMoney();
  const { showToast } = useToast();
  const { products, categories, settings, ready } = useDataManager();
  const cart = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | 'all'>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  const categoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Uncategorized';

  const displayProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter(p => categoryId === 'all' || p.categoryId === categoryId)
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, categoryId]);

  const addToCart = (product: Product) => {
    const err = cart.add(product);
    if (err) showToast(err, product.quantity <= 0 ? 'error' : 'warning');
  };

  // Barcode scanners type the code and press Enter — add an exact SKU match instantly
  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const exact = products.find(p => p.sku.toLowerCase() === q);
    const target = exact || (displayProducts.length === 1 ? displayProducts[0] : undefined);
    if (target) {
      addToCart(target);
      setSearchQuery('');
    } else {
      showToast(`No product matches “${searchQuery.trim()}”`, 'info');
    }
  };

  const taxPreview = Math.round(cart.subtotal * (settings.taxRate || 0)) / 100;
  const totalPreview = cart.subtotal + taxPreview;

  const handleCheckout = () => {
    if (cart.lines.length > 0) router.push('/dashboard/process-checkout');
  };

  const handleClear = () => {
    if (cart.lines.length && confirm('Remove all items from the current bill?')) cart.clear();
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_380px] lg:h-[calc(100vh-89px)]">
      {/* Products */}
      <div className="flex min-h-0 flex-col gap-4">
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/60" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search products by name or SKU"
              placeholder="Search name or scan / type SKU, then press Enter"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              autoFocus
              className="w-full rounded-lg border border-[#ccc5b9] bg-white py-2.5 pl-10 pr-10 text-[#252422] placeholder-[#403d39]/50 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]"
            />
            <ScanLine className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/40" aria-hidden />
          </div>
          {categories.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by category">
              {[{ id: 'all' as const, name: 'All' }, ...categories].map(c => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={categoryId === c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    categoryId === c.id ? 'bg-[#eb5e28] text-white' : 'bg-[#ccc5b9]/30 text-[#403d39] hover:bg-[#ccc5b9]/50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="min-h-[320px] flex-1 overflow-y-auto">
          {!ready ? (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-[#ccc5b9]/20" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <PackagePlus className="mb-3 h-12 w-12 text-[#ccc5b9]" />
              <p className="font-semibold text-[#252422]">Your inventory is empty</p>
              <p className="mb-4 text-sm text-[#403d39]">Add products to start ringing up sales.</p>
              <Button onClick={() => router.push('/inventory/add-inventory')}>
                <Plus className="h-4 w-4" /> Add products
              </Button>
            </div>
          ) : displayProducts.length === 0 ? (
            <p className="p-8 text-center text-[#403d39]">No products match your search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4">
              {displayProducts.map(product => {
                const inCart = cart.lines.find(l => l.product.id === product.id)?.quantity ?? 0;
                const out = product.quantity <= 0;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={out}
                    className="group relative flex flex-col rounded-lg border border-[#ccc5b9] bg-gradient-to-br from-white to-[#fffcf2] p-3 text-left transition-all hover:border-[#eb5e28] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inCart > 0 && (
                      <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eb5e28] px-1.5 text-xs font-bold text-white">
                        {inCart}
                      </span>
                    )}
                    <span className="line-clamp-2 pr-6 font-semibold text-[#252422] group-hover:text-[#eb5e28]">{product.name}</span>
                    <span className="mt-0.5 truncate text-xs text-[#403d39]/70">
                      {product.sku} · {categoryName(product.categoryId)}
                    </span>
                    <span className="mt-auto flex items-end justify-between pt-3">
                      <span className="text-lg font-bold text-[#eb5e28]">{money(product.price)}</span>
                      <span
                        className={`text-xs ${
                          out ? 'text-red-600' : product.status === 'Low Stock' ? 'text-yellow-700' : 'text-[#403d39]'
                        }`}
                      >
                        {out ? 'Out of stock' : `${product.quantity} left`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Bill */}
      <Card className="flex min-h-[420px] flex-col p-4 lg:min-h-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#252422]">
            <ShoppingCart className="h-5 w-5 text-[#eb5e28]" /> Current bill
          </h2>
          <span className="text-sm text-[#403d39]">{cart.itemCount} item(s)</span>
        </div>

        <div className="-mx-1 mb-4 flex-1 space-y-2 overflow-y-auto px-1">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center text-sm text-[#403d39]/70">
              <p>Tap a product or scan a SKU to add it.</p>
            </div>
          ) : (
            cart.lines.map(({ product, quantity }) => (
              <div key={product.id} className="rounded-lg border border-[#ccc5b9]/40 bg-[#fffcf2] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-[#252422]">{product.name}</p>
                    <p className="text-xs text-[#403d39]/70">{money(product.price)} each</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="shrink-0 rounded p-1 transition-colors hover:bg-red-100"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => cart.setQuantity(product.id, quantity - 1)}
                    className="rounded bg-[#eb5e28]/15 p-1.5 text-[#eb5e28] hover:bg-[#eb5e28]/25"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={product.quantity}
                    aria-label={`Quantity of ${product.name}`}
                    value={quantity}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) {
                        const err = cart.setQuantity(product.id, Math.max(v, 1));
                        if (err) showToast(err, 'warning');
                      }
                    }}
                    className="no-spin w-14 rounded border border-[#ccc5b9] px-2 py-1 text-center text-sm text-[#252422]"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => {
                      const err = cart.setQuantity(product.id, quantity + 1);
                      if (err) showToast(err, 'warning');
                    }}
                    className="rounded bg-[#eb5e28]/15 p-1.5 text-[#eb5e28] hover:bg-[#eb5e28]/25"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="ml-auto whitespace-nowrap font-semibold text-[#eb5e28]">{money(product.price * quantity)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 border-t border-[#ccc5b9]/40 pt-3 text-sm text-[#403d39]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax {settings.taxRate ? `(${settings.taxRate}%)` : ''}</span>
            <span>{money(taxPreview)}</span>
          </div>
          {!settings.taxRate && (
            <p className="text-xs text-[#403d39]/70">
              No tax rate set. <Link href="/settings" className="underline">Configure in Settings</Link>
            </p>
          )}
          <div className="flex items-center justify-between border-t border-[#eb5e28]/30 pt-3">
            <span className="font-semibold text-[#252422]">Total</span>
            <span className="text-2xl font-bold text-[#eb5e28]">{money(totalPreview)}</span>
          </div>
        </div>

        <Button className="mt-4 w-full" size="lg" disabled={cart.lines.length === 0} onClick={handleCheckout}>
          Checkout
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={handleClear} disabled={cart.lines.length === 0}>
          Clear bill
        </Button>
      </Card>
    </div>
  );
}
