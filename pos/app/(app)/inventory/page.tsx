'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import StatCard from '@/components/stat-card';
import EditInventoryModal from '@/components/edit-inventory-modal';
import { Plus, Search, Download, Package, AlertTriangle, XCircle, Coins, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/app/providers/toast-provider';
import { useDataManager, useMoney } from '@/lib/storage';
import type { Product } from '@/lib/storage/types';

type StatusFilter = 'all' | 'In Stock' | 'Low Stock' | 'Out of Stock' | 'attention';
type SortKey = 'name' | 'sku' | 'quantity' | 'price' | 'updated';

const controlCls =
  'rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-sm text-[#252422] focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

export default function Inventory() {
  const router = useRouter();
  const money = useMoney();
  const { showToast } = useToast();
  const { products, categories, deleteProduct, updateProduct, exportData, ready } = useDataManager();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editing, setEditing] = useState<Product | null>(null);

  // Deep link from the header's stock alerts: /inventory?status=low
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read URL after mount; page is statically prerendered
    if (status === 'low') setFilterStatus('attention');
  }, []);

  const categoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Uncategorized';

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter(p => {
      if (filterStatus === 'attention' && p.status === 'In Stock') return false;
      if (filterStatus !== 'all' && filterStatus !== 'attention' && p.status !== filterStatus) return false;
      if (filterCategory !== 'all' && String(p.categoryId) !== filterCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        categoryName(p.categoryId).toLowerCase().includes(q)
      );
    });
    const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      sku: (a, b) => a.sku.localeCompare(b.sku),
      quantity: (a, b) => a.quantity - b.quantity,
      price: (a, b) => b.price - a.price,
      updated: (a, b) => b.updatedAt - a.updatedAt,
    };
    return [...list].sort(sorters[sortBy]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories, searchQuery, sortBy, filterStatus, filterCategory]);

  const stats = useMemo(
    () => ({
      units: products.reduce((s, p) => s + p.quantity, 0),
      value: products.reduce((s, p) => s + p.quantity * p.price, 0),
      low: products.filter(p => p.status === 'Low Stock').length,
      out: products.filter(p => p.status === 'Out of Stock').length,
    }),
    [products]
  );

  const handleDelete = (p: Product) => {
    if (confirm(`Delete “${p.name}”? Past sales keep their records.`)) {
      deleteProduct(p.id);
      showToast(`${p.name} deleted`, 'success');
    }
  };

  const handleRestock = (p: Product) => {
    const input = prompt(`Add stock for “${p.name}” (current: ${p.quantity})`, '10');
    if (input === null) return;
    const add = parseInt(input, 10);
    if (Number.isNaN(add) || add <= 0) return showToast('Enter a positive whole number', 'error');
    updateProduct(p.id, { quantity: p.quantity + add });
    showToast(`Added ${add} × ${p.name}`, 'success');
  };

  return (
    <div className="w-full">
      <Header
        title="Inventory"
        subtitle="Manage products, prices and stock levels"
        actions={
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/inventory/add-inventory')}>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Package} label="Products" value={products.length} hint={`${stats.units} units in stock`} />
          <StatCard icon={Coins} label="Stock value" value={money(stats.value)} hint="At selling price" />
          <StatCard icon={AlertTriangle} label="Low stock" value={stats.low} hint="At or below reorder level" />
          <StatCard icon={XCircle} label="Out of stock" value={stats.out} hint="Cannot be sold" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/60" aria-hidden />
            <input
              type="search"
              aria-label="Search inventory"
              placeholder="Search by name, SKU or category…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#ccc5b9] bg-white py-2 pl-10 pr-4 text-[#252422] placeholder-[#403d39]/50 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusFilter)} className={controlCls}>
              <option value="all">All statuses</option>
              <option value="attention">Needs reorder</option>
              <option value="In Stock">In stock</option>
              <option value="Low Stock">Low stock</option>
              <option value="Out of Stock">Out of stock</option>
            </select>
            <select aria-label="Filter by category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={controlCls}>
              <option value="all">All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className={controlCls}>
              <option value="name">Sort: Name</option>
              <option value="sku">Sort: SKU</option>
              <option value="quantity">Sort: Quantity (low first)</option>
              <option value="price">Sort: Price (high first)</option>
              <option value="updated">Sort: Recently updated</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => exportData('csv', 'products')} disabled={!products.length}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="sm:hidden" onClick={() => router.push('/inventory/add-inventory')}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-[#ccc5b9]/40 bg-[#fffcf2]/60 text-left text-sm font-semibold text-[#252422]">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-right">Reorder at</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(item => (
                  <tr key={item.id} className="border-b border-[#ccc5b9]/20 text-sm transition-colors hover:bg-[#ccc5b9]/10">
                    <td className="px-5 py-3 font-medium text-[#252422]">{item.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#403d39]">{item.sku}</td>
                    <td className="px-5 py-3 text-[#403d39]">{categoryName(item.categoryId)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#252422]">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-[#403d39]">{money(item.price)}</td>
                    <td className="px-5 py-3 text-right text-[#403d39]">{item.reorder}</td>
                    <td className="px-5 py-3">
                      <Badge variant={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Restock" aria-label={`Restock ${item.name}`} onClick={() => handleRestock(item)} className="rounded p-2 text-green-700 hover:bg-green-50">
                          <PackagePlus className="h-4 w-4" />
                        </button>
                        <button type="button" title="Edit" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)} className="rounded p-2 text-[#403d39] hover:bg-[#ccc5b9]/30">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" title="Delete" aria-label={`Delete ${item.name}`} onClick={() => handleDelete(item)} className="rounded p-2 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {ready && visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[#403d39]">
                      {products.length === 0 ? (
                        <div className="flex flex-col items-center gap-3">
                          <p>No products yet. Add items one by one or import a CSV.</p>
                          <Button onClick={() => router.push('/inventory/add-inventory')}>
                            <Plus className="h-4 w-4" /> Add your first product
                          </Button>
                        </div>
                      ) : (
                        'No products match these filters.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {editing && (
        <EditInventoryModal
          key={editing.id}
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={name => {
            setEditing(null);
            showToast(`${name} updated`, 'success');
          }}
        />
      )}
    </div>
  );
}
