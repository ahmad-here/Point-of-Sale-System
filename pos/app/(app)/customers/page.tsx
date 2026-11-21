'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Modal from '@/components/modal';
import StatCard from '@/components/stat-card';
import { Users, Plus, Search, Download, Pencil, Trash2, Crown, Repeat } from 'lucide-react';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import type { Customer } from '@/lib/storage/types';

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

type Form = { name: string; phone: string; email: string; address: string };
const empty: Form = { name: '', phone: '', email: '', address: '' };

export default function Customers() {
  const money = useMoney();
  const { showToast } = useToast();
  const { customers, sales, addCustomer, updateCustomer, deleteCustomer, exportData, ready } = useDataManager();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'name' | 'recent'>('spent');
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = customers.filter(
      c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
    );
    const sorters = {
      spent: (a: Customer, b: Customer) => b.totalSpent - a.totalSpent,
      name: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      recent: (a: Customer, b: Customer) => b.updatedAt - a.updatedAt,
    };
    return [...l].sort(sorters[sortBy]);
  }, [customers, query, sortBy]);

  const repeat = customers.filter(c => c.totalPurchases > 1).length;
  const top = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0];

  const historyFor = (c: Customer) =>
    sales
      .filter(s => {
        if (c.phone && s.phoneNumber) return s.phoneNumber.replace(/\D/g, '') === c.phone.replace(/\D/g, '');
        return s.customer.toLowerCase() === c.name.toLowerCase();
      })
      .sort((a, b) => (b.timestamp || b.createdAt) - (a.timestamp || a.createdAt));

  const openEdit = (c: Customer | 'new') => {
    setEditing(c);
    setError('');
    setForm(c === 'new' ? empty : { name: c.name, phone: c.phone, email: c.email, address: c.address || '' });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required.');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    const data = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim() };
    if (editing === 'new') {
      addCustomer({ ...data, totalPurchases: 0, totalSpent: 0 });
      showToast(`${data.name} added`, 'success');
    } else if (editing) {
      updateCustomer(editing.id, data);
      showToast(`${data.name} updated`, 'success');
    }
    setEditing(null);
  };

  const remove = (c: Customer) => {
    if (confirm(`Delete ${c.name}? Their past sales are kept.`)) {
      deleteCustomer(c.id);
      showToast('Customer deleted', 'success');
    }
  };

  return (
    <div className="w-full">
      <Header
        title="Customers"
        subtitle="Repeat buyers and their purchase history"
        actions={
          <Button size="sm" onClick={() => openEdit('new')}>
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add customer</span>
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Customers" value={customers.length} hint="Saved from checkout or added manually" />
          <StatCard icon={Repeat} label="Repeat customers" value={repeat} hint={customers.length ? `${Math.round((repeat / customers.length) * 100)}% came back` : '—'} />
          <StatCard icon={Crown} label="Top customer" value={top ? top.name : '—'} hint={top ? `${money(top.totalSpent)} spent` : 'No purchases yet'} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/60" aria-hidden />
            <input
              type="search"
              aria-label="Search customers"
              placeholder="Search name, phone or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-lg border border-[#ccc5b9] bg-white py-2 pl-10 pr-4 text-sm text-[#252422] placeholder-[#403d39]/50 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]"
            />
          </div>
          <select aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-sm">
            <option value="spent">Top spenders</option>
            <option value="recent">Recently active</option>
            <option value="name">Name A–Z</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => exportData('csv', 'customers')} disabled={!customers.length}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#ccc5b9]/40 bg-[#fffcf2]/60 text-left text-sm font-semibold text-[#252422]">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                  <th className="px-5 py-3 text-right">Total spent</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id} className="border-b border-[#ccc5b9]/20 text-sm hover:bg-[#ccc5b9]/10">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setViewing(c)} className="font-medium text-[#252422] hover:text-[#eb5e28] hover:underline">
                        {c.name}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-[#403d39]">
                      {c.phone || '—'}
                      {c.email && <span className="block text-xs text-[#403d39]/70">{c.email}</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-[#403d39]">{c.totalPurchases}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#252422]">{money(c.totalSpent)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded p-2 text-[#403d39] hover:bg-[#ccc5b9]/30">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="rounded p-2 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {ready && list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#403d39]">
                      {customers.length === 0 ? 'No customers yet. Enter a name or phone at checkout to save one.' : 'No customers match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add customer' : 'Edit customer'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="customer-form">Save</Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={save} className="space-y-3">
          {error && <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          {(['name', 'phone', 'email', 'address'] as const).map(k => (
            <label key={k} className="block">
              <span className="mb-1 block text-sm font-medium capitalize text-[#252422]">{k}{k === 'name' ? ' *' : ''}</span>
              <input
                type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'}
                value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className={inputCls}
                autoFocus={k === 'name'}
              />
            </label>
          ))}
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || ''} size="md">
        {viewing && (
          <div>
            <p className="mb-4 text-sm text-[#403d39]">
              {[viewing.phone, viewing.email, viewing.address].filter(Boolean).join(' · ') || 'No contact details'}
            </p>
            <h3 className="mb-2 font-semibold text-[#252422]">Purchase history</h3>
            <ul className="divide-y divide-[#ccc5b9]/30">
              {historyFor(viewing).map(s => (
                <li key={s.id} className="flex justify-between py-2 text-sm">
                  <span>
                    {s.orderId} · {new Date(s.timestamp || s.createdAt).toLocaleDateString()}
                    {s.status === 'Cancelled' && <span className="ml-2 text-xs text-red-600">refunded</span>}
                  </span>
                  <span className="font-semibold">{money(s.total)}</span>
                </li>
              ))}
              {historyFor(viewing).length === 0 && <li className="py-2 text-sm text-[#403d39]">No sales found.</li>}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
