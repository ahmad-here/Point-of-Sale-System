'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Modal from '@/components/modal';
import DataBackupModal from '@/components/data-backup-modal';
import { Store, Receipt, Package, Database, AlertTriangle, Save, Tags, Trash2 } from 'lucide-react';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import StorageUtils from '@/lib/storage/utils';
import type { SystemSettings, PaymentMethod } from '@/lib/storage/types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'PKR', 'AED', 'SAR', 'NGN', 'ZAR', 'KES', 'BDT', 'PHP', 'MYR', 'SGD', 'JPY', 'CNY', 'BRL', 'MXN', 'TRY', 'EGP'];
const METHODS: PaymentMethod[] = ['Cash', 'Credit Card', 'Digital Wallet', 'Bank Transfer', 'Check'];

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

function Section({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-[#eb5e28]/15 p-2.5 text-[#eb5e28]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-[#252422]">{title}</h2>
          <p className="text-sm text-[#403d39]">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#252422]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#403d39]/70">{hint}</span>}
    </label>
  );
}

export default function Settings() {
  const { settings, updateSettings, clearAllData, storageQuota, categories, products, updateCategory, deleteCategory, ready } = useDataManager();
  const { showToast } = useToast();
  const money = useMoney();
  // Unsaved edits layered over the saved settings
  const [draft, setDraft] = useState<Partial<SystemSettings>>({});
  const form: SystemSettings = { ...settings, ...draft };
  const [backupOpen, setBackupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState('');

  const dirty = (Object.keys(draft) as (keyof SystemSettings)[]).some(k => draft[k] !== settings[k]);
  const set = <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) => setDraft(d => ({ ...d, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return showToast('Store name is required', 'error');
    if (form.businessEmail && !/^\S+@\S+\.\S+$/.test(form.businessEmail)) return showToast('Enter a valid email address', 'error');
    const taxRate = Math.min(Math.max(Number(form.taxRate) || 0, 0), 100);
    updateSettings({ ...draft, businessName: form.businessName.trim(), taxRate, lowStockThreshold: Math.max(Number(form.lowStockThreshold) || 0, 0) });
    setDraft({});
    showToast('Settings saved', 'success');
  };

  const renameCategory = (id: number, current: string) => {
    const name = prompt('Rename category', current)?.trim();
    if (!name || name === current) return;
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) return showToast('A category with that name exists', 'error');
    updateCategory(id, { name });
    showToast('Category renamed', 'success');
  };

  const removeCategory = (id: number, name: string) => {
    const count = products.filter(p => p.categoryId === id).length;
    if (count) return showToast(`Move or delete the ${count} product(s) in “${name}” first`, 'warning');
    if (confirm(`Delete category “${name}”?`)) {
      deleteCategory(id);
      showToast('Category deleted', 'success');
    }
  };

  const doReset = () => {
    clearAllData();
    setDraft({});
    setResetOpen(false);
    setResetText('');
    showToast('All data has been erased', 'success');
  };

  return (
    <div className="w-full">
      <Header title="Settings" subtitle="Store profile, taxes, receipts and data" />

      <form onSubmit={save} className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <Section icon={Store} title="Store profile" description="Shown on receipts and in the app header.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Store name *">
              <input className={inputCls} value={form.businessName} onChange={e => set('businessName', e.target.value)} disabled={!ready} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} type="tel" value={form.businessPhone} onChange={e => set('businessPhone', e.target.value)} />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" value={form.businessEmail} onChange={e => set('businessEmail', e.target.value)} />
            </Field>
            <Field label="Address">
              <textarea className={`${inputCls} resize-none`} rows={2} value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section icon={Receipt} title="Sales, tax & receipts" description="Applied to every new checkout.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Currency" hint={`Preview: ${money(1234.5)}`}>
              <select className={inputCls} value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sales tax / VAT (%)" hint="Use 0 if prices already include tax.">
              <input className={inputCls} type="number" min={0} max={100} step="0.01" value={form.taxRate} onChange={e => set('taxRate', e.target.value === '' ? 0 : Number(e.target.value))} />
            </Field>
            <Field label="Default payment method">
              <select className={inputCls} value={form.defaultPaymentMethod} onChange={e => set('defaultPaymentMethod', e.target.value as PaymentMethod)}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <div className="md:col-span-3">
              <Field label="Receipt footer message">
                <input className={inputCls} value={form.receiptFooter} maxLength={160} onChange={e => set('receiptFooter', e.target.value)} placeholder="Thank you for your purchase!" />
              </Field>
            </div>
          </div>
        </Section>

        <Section icon={Package} title="Inventory alerts" description="Control low-stock warnings.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Default reorder level" hint="Pre-filled for new products. Each product can override it.">
              <input className={inputCls} type="number" min={0} step={1} value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value === '' ? 0 : Number(e.target.value))} />
            </Field>
            <label className="flex items-center gap-3 self-center rounded-lg border border-[#ccc5b9]/60 p-3">
              <input type="checkbox" className="h-4 w-4 accent-[#eb5e28]" checked={form.lowStockAlerts} onChange={e => set('lowStockAlerts', e.target.checked)} />
              <span className="text-sm text-[#252422]">Show low-stock alerts in the header bell</span>
            </label>
          </div>
        </Section>

        <div className="sticky bottom-20 z-20 flex justify-end md:bottom-4">
          <Button type="submit" size="lg" disabled={!dirty} className="shadow-2xl">
            <Save className="h-4 w-4" /> {dirty ? 'Save changes' : 'All changes saved'}
          </Button>
        </div>

        <Section icon={Tags} title="Categories" description="Rename or remove product categories.">
          {categories.length === 0 ? (
            <p className="text-sm text-[#403d39]">No categories yet. They’re created when you add products.</p>
          ) : (
            <ul className="divide-y divide-[#ccc5b9]/30">
              {categories.map(c => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#252422]">
                    {c.name} <span className="text-[#403d39]/60">({products.filter(p => p.categoryId === c.id).length})</span>
                  </span>
                  <span className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => renameCategory(c.id, c.name)}>Rename</Button>
                    <button type="button" onClick={() => removeCategory(c.id, c.name)} aria-label={`Delete ${c.name}`} className="rounded p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={Database} title="Backup & restore" description="Your data lives in this browser only. Back it up regularly.">
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm text-[#403d39]">
              <span>Browser storage used</span>
              <span>
                {StorageUtils.formatFileSize(storageQuota.used)} of ~{StorageUtils.formatFileSize(storageQuota.limit)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#ccc5b9]/30">
              <div className={`h-2 rounded-full ${storageQuota.percentage > 80 ? 'bg-red-500' : 'bg-[#eb5e28]'}`} style={{ width: `${Math.min(storageQuota.percentage, 100)}%` }} />
            </div>
          </div>
          <Button variant="secondary" onClick={() => setBackupOpen(true)}>
            <Database className="h-4 w-4" /> Export, import or merge data
          </Button>
        </Section>

        <Card className="border-red-300 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-[#252422]">Danger zone</h2>
          </div>
          <p className="mb-4 text-sm text-[#403d39]">Erase every product, sale, payment, customer and setting stored in this browser. Download a backup first.</p>
          <Button variant="danger" onClick={() => setResetOpen(true)}>Erase all data</Button>
        </Card>
      </form>

      <DataBackupModal isOpen={backupOpen} onClose={() => setBackupOpen(false)} />

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Erase all data?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={resetText !== 'ERASE'} onClick={doReset}>Erase everything</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-[#403d39]">This permanently deletes all data in this browser and cannot be undone. Type <strong>ERASE</strong> to confirm.</p>
        <input className={inputCls} value={resetText} onChange={e => setResetText(e.target.value)} autoFocus aria-label="Type ERASE to confirm" />
      </Modal>
    </div>
  );
}
