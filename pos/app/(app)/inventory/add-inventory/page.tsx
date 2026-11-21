'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import { ArrowLeft, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/app/providers/toast-provider';
import { useDataManager } from '@/lib/storage';
import Database from '@/lib/storage/database';

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-4 py-2 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

/** Minimal RFC 4180 CSV parser (handles quotes, escaped quotes and CRLF). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(c => c.trim() !== '')) rows.push(row);
  return rows;
}

const TEMPLATE = 'name,sku,category,quantity,price,reorderlevel\nWireless Mouse,WM-001,Electronics,150,24.99,20\n"USB-C Cable, 2m",USB-002,Accessories,300,9.5,50\n';

export default function AddInventory() {
  const router = useRouter();
  const { showToast } = useToast();
  const { addCategory, categories, addProduct, skuExists, settings, refreshData } = useDataManager();
  const [activeTab, setActiveTab] = useState<'form' | 'csv'>('form');
  const [formError, setFormError] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvReport, setCsvReport] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const emptyForm = { name: '', sku: '', categoryId: '', quantity: '', price: '', reorderLevel: '' };
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'categoryId' && value === 'other') {
      setIsCustomCategory(true);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return setFormError('Please enter a category name');
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return setFormError('Category already exists');
    const created = addCategory({ name });
    setFormData(prev => ({ ...prev, categoryId: String(created.id) }));
    setNewCategoryName('');
    setIsCustomCategory(false);
    setFormError('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(formData.quantity, 10);
    const price = parseFloat(formData.price);
    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId || formData.quantity === '' || formData.price === '') {
      return setFormError('Please fill in all required fields');
    }
    if (Number.isNaN(quantity) || quantity < 0) return setFormError('Quantity must be 0 or more');
    if (Number.isNaN(price) || price < 0) return setFormError('Price must be 0 or more');
    if (skuExists(formData.sku)) return setFormError(`SKU “${formData.sku}” is already used by another product`);

    const reorder = parseInt(formData.reorderLevel, 10);
    addProduct({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      categoryId: Number(formData.categoryId),
      quantity,
      price: Math.round(price * 100) / 100,
      reorder: Number.isNaN(reorder) ? settings.lowStockThreshold : Math.max(reorder, 0),
    });
    showToast(`${formData.name} added`, 'success');
    // Keep the category selected — users often add several items from one category
    setFormData({ ...emptyForm, categoryId: formData.categoryId });
    setFormError('');
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) return setCsvError('Please select a CSV file');
    setCsvReport(null);
    try {
      const rows = parseCSV(await csvFile.text());
      if (rows.length < 2) return setCsvError('The file needs a header row and at least one product row.');

      const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));
      const col = (...names: string[]) => headers.findIndex(h => names.includes(h));
      const idx = {
        name: col('name', 'productname'),
        sku: col('sku', 'barcode', 'code'),
        category: col('category', 'categoryname'),
        quantity: col('quantity', 'qty', 'stock'),
        price: col('price', 'sellingprice', 'unitprice'),
        reorder: col('reorderlevel', 'reorder'),
      };
      const missing = (['name', 'sku', 'category', 'quantity'] as const).filter(k => idx[k] === -1);
      if (missing.length) return setCsvError(`Missing required column(s): ${missing.join(', ')}`);

      let created = 0;
      let restocked = 0;
      const skipped: string[] = [];

      rows.slice(1).forEach((r, i) => {
        const get = (k: keyof typeof idx) => (idx[k] >= 0 ? (r[idx[k]] ?? '').trim() : '');
        const name = get('name');
        const sku = get('sku');
        const quantity = parseInt(get('quantity'), 10);
        const price = parseFloat(get('price').replace(/[^0-9.\-]/g, ''));
        const reorder = parseInt(get('reorder'), 10);
        if (!name || !sku || Number.isNaN(quantity) || quantity < 0) {
          skipped.push(`row ${i + 2}`);
          return;
        }
        const existing = Database.getProducts().find(p => p.sku.toLowerCase() === sku.toLowerCase());
        if (existing) {
          // Same SKU: treat the row as a stock delivery
          Database.updateProduct(existing.id, {
            quantity: existing.quantity + quantity,
            ...(Number.isNaN(price) ? {} : { price }),
          });
          restocked++;
          return;
        }
        const category = Database.addCategory(get('category') || 'Uncategorized');
        Database.addProduct({
          name,
          sku,
          categoryId: category.id,
          quantity,
          price: Number.isNaN(price) ? 0 : Math.round(price * 100) / 100,
          reorder: Number.isNaN(reorder) ? settings.lowStockThreshold : reorder,
        });
        created++;
      });

      refreshData();
      if (created + restocked === 0) return setCsvError('No valid product rows were found in the file.');

      const report = `${created} new product(s) added, ${restocked} existing SKU(s) restocked${skipped.length ? `, ${skipped.length} skipped (${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '…' : ''})` : ''}.`;
      setCsvReport(report);
      showToast('CSV imported', 'success');
      setCsvFile(null);
      setCsvError('');
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Could not read the CSV file. Please check the format.');
    }
  };

  const tabCls = (on: boolean) =>
    `border-b-2 px-4 pb-4 font-semibold transition-colors ${on ? 'border-[#eb5e28] text-[#eb5e28]' : 'border-transparent text-[#403d39] hover:text-[#252422]'}`;

  return (
    <div className="w-full">
      <Header
        title="Add inventory"
        subtitle="Add products one at a time or import a spreadsheet"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push('/inventory')}>
            <ArrowLeft className="h-4 w-4" /> Inventory
          </Button>
        }
      />

      <div className="flex justify-center p-4 sm:p-6">
        <Card className="w-full max-w-4xl">
          <div className="flex border-b border-[#ccc5b9]/30 px-6 pt-6" role="tablist">
            <button type="button" role="tab" aria-selected={activeTab === 'form'} onClick={() => setActiveTab('form')} className={tabCls(activeTab === 'form')}>
              Single product
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'csv'} onClick={() => setActiveTab('csv')} className={tabCls(activeTab === 'csv')}>
              Import CSV
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'form' ? (
              <form onSubmit={handleSubmitForm} className="space-y-4" noValidate>
                {formError && <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">{formError}</div>}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">Product name *</span>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Cappuccino 12oz" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">SKU / barcode *</span>
                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="e.g. CAP-12" className={inputCls} />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">Category *</span>
                    {!isCustomCategory ? (
                      <select name="categoryId" aria-label="Category" value={formData.categoryId} onChange={handleInputChange} className={inputCls}>
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="other">+ Add new category</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label="New category name"
                          placeholder="Category name"
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          autoFocus
                          className={inputCls}
                        />
                        <Button size="sm" onClick={handleAddCategory}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setIsCustomCategory(false); setNewCategoryName(''); }}>Cancel</Button>
                      </div>
                    )}
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">Selling price *</span>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" inputMode="decimal" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">Opening quantity *</span>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="0" min="0" step="1" inputMode="numeric" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#252422]">Reorder level</span>
                    <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleInputChange} placeholder={String(settings.lowStockThreshold)} min="0" step="1" inputMode="numeric" className={inputCls} />
                    <span className="mt-1 block text-xs text-[#403d39]/70">You’ll get a low-stock alert at or below this quantity.</span>
                  </label>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button variant="ghost" onClick={() => router.push('/inventory')} className="flex-1">Done</Button>
                  <Button type="submit" className="flex-1">Add product</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {csvError && <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700" role="alert">{csvError}</div>}
                {csvReport && <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">{csvReport}</div>}

                <label className="block cursor-pointer rounded-lg border-2 border-dashed border-[#ccc5b9] p-8 text-center transition-colors hover:border-[#eb5e28]">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-[#eb5e28]" />
                  <span className="mb-2 block font-semibold text-[#252422]">{csvFile ? csvFile.name : 'Choose a CSV file'}</span>
                  <span className="block text-sm text-[#403d39]">
                    Required columns: name, sku, category, quantity. Optional: price, reorderlevel.
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={e => {
                      setCsvFile(e.target.files?.[0] ?? null);
                      setCsvError('');
                      setCsvReport(null);
                    }}
                    className="sr-only"
                  />
                </label>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                      <FileSpreadsheet className="h-4 w-4" /> Example format
                    </p>
                    <Button size="sm" variant="ghost" onClick={downloadTemplate}>
                      <Download className="h-4 w-4" /> Template
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded border border-blue-100 bg-white p-3 text-xs">{TEMPLATE}</pre>
                  <p className="mt-2 text-xs text-blue-900">
                    Rows whose SKU already exists add to that product’s stock (useful for deliveries). New categories are created automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button variant="ghost" onClick={() => router.push('/inventory')} className="flex-1">Back</Button>
                  <Button onClick={handleCSVUpload} disabled={!csvFile} className="flex-1">Import products</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
