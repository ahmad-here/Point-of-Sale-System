'use client';

import { useState } from 'react';
import Modal from '@/components/modal';
import Button from '@/components/button';
import { useDataManager } from '@/lib/storage';
import type { Product } from '@/lib/storage/types';

interface EditInventoryModalProps {
  /** Render with key={product.id} so the form re-initialises per product */
  product: Product;
  onClose: () => void;
  onSaved: (name: string) => void;
}

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-4 py-2 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

export default function EditInventoryModal({ product, onClose, onSaved }: EditInventoryModalProps) {
  const { categories, updateProduct, skuExists, addCategory } = useDataManager();
  const [form, setForm] = useState(() => ({
    name: product.name,
    sku: product.sku,
    categoryId: String(product.categoryId),
    quantity: String(product.quantity),
    price: String(product.price),
    reorder: String(product.reorder),
  }));
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(form.quantity, 10);
    const price = parseFloat(form.price);
    const reorder = parseInt(form.reorder, 10);
    if (!form.name.trim() || !form.sku.trim()) return setError('Name and SKU are required.');
    if (form.categoryId === 'new' && !newCategory.trim()) return setError('Enter a name for the new category.');
    if (!form.categoryId) return setError('Choose a category.');
    if (Number.isNaN(quantity) || quantity < 0) return setError('Quantity must be 0 or more.');
    if (Number.isNaN(price) || price < 0) return setError('Price must be 0 or more.');
    if (skuExists(form.sku, product.id)) return setError('Another product already uses this SKU.');

    const categoryId = form.categoryId === 'new' ? addCategory({ name: newCategory }).id : Number(form.categoryId);

    updateProduct(product.id, {
      name: form.name.trim(),
      sku: form.sku.trim(),
      categoryId,
      quantity,
      price: Math.round(price * 100) / 100,
      reorder: Number.isNaN(reorder) ? 0 : Math.max(reorder, 0),
    });
    onSaved(form.name.trim());
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit product"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-product-form">Save changes</Button>
        </>
      }
    >
      <form id="edit-product-form" onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">Product name *</span>
            <input name="name" value={form.name} onChange={set} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">SKU / barcode *</span>
            <input name="sku" value={form.sku} onChange={set} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">Category *</span>
            <select name="categoryId" value={form.categoryId} onChange={set} className={inputCls}>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="new">+ New category…</option>
            </select>
            {form.categoryId === 'new' && (
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className={`${inputCls} mt-2`} autoFocus />
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">Selling price *</span>
            <input name="price" type="number" min={0} step="0.01" inputMode="decimal" value={form.price} onChange={set} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">Quantity in stock *</span>
            <input name="quantity" type="number" min={0} step={1} inputMode="numeric" value={form.quantity} onChange={set} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-[#252422]">Reorder level</span>
            <input name="reorder" type="number" min={0} step={1} inputMode="numeric" value={form.reorder} onChange={set} className={inputCls} />
            <span className="mt-1 block text-xs text-[#403d39]/70">Marked “Low Stock” at or below this quantity.</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
