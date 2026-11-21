'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import StatCard from '@/components/stat-card';
import AddPaymentModal from '@/components/add-payment-modal';
import { Plus, DollarSign, CheckCircle, Clock, Search, Download, RotateCcw, Trash2, Check } from 'lucide-react';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import type { Payment } from '@/lib/storage/types';

const controlCls =
  'rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-sm text-[#252422] focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

const statusVariant = (s: Payment['status']) =>
  ({ Completed: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'info' } as const)[s];

const methodColor: Record<string, string> = {
  'Credit Card': 'bg-blue-100 text-blue-700',
  Cash: 'bg-green-100 text-green-700',
  'Digital Wallet': 'bg-purple-100 text-purple-700',
  'Bank Transfer': 'bg-orange-100 text-orange-700',
  Check: 'bg-gray-100 text-gray-700',
};

export default function Payments() {
  const money = useMoney();
  const { showToast } = useToast();
  const { payments, sales, updatePayment, deletePayment, refundSale, exportData, ready } = useDataManager();
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | Payment['status']>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | Payment['method']>('all');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = payments.filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterMethod !== 'all' && p.method !== filterMethod) return false;
      if (!q) return true;
      return (
        p.orderId.toLowerCase().includes(q) ||
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.phoneNumber || '').includes(q) ||
        p.amount.toFixed(2).includes(q)
      );
    });
    const sorted = [...list];
    if (sortBy === 'date') sorted.sort((a, b) => b.timestamp - a.timestamp);
    if (sortBy === 'amount') sorted.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'name') sorted.sort((a, b) => (a.customerName || '~').localeCompare(b.customerName || '~'));
    return sorted;
  }, [payments, searchQuery, sortBy, filterStatus, filterMethod]);

  const completed = useMemo(() => payments.filter(p => p.status === 'Completed'), [payments]);
  const pending = useMemo(() => payments.filter(p => p.status === 'Pending'), [payments]);
  const revenue = completed.reduce((s, p) => s + p.amount, 0);

  const byMethod = useMemo(() => {
    const m: Record<string, number> = {};
    completed.forEach(p => (m[p.method] = (m[p.method] || 0) + p.amount));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [completed]);

  const setStatus = (p: Payment, status: Payment['status']) => {
    // Refunding a register sale should also return its items to stock
    const sale = sales.find(s => s.orderId === p.orderId && s.status === 'Completed');
    if (status === 'Refunded' && sale) {
      if (!confirm(`Refund order ${p.orderId}? Its items will be returned to stock.`)) return;
      const r = refundSale(sale.id);
      return r.ok ? showToast(`Order ${p.orderId} refunded`, 'success') : showToast(r.error || 'Refund failed', 'error');
    }
    if (status === 'Refunded' && !confirm(`Mark payment ${p.orderId} as refunded?`)) return;
    updatePayment(p.id, { status });
    showToast(`Payment ${p.orderId} marked ${status.toLowerCase()}`, 'success');
  };

  const handleDelete = (p: Payment) => {
    if (confirm(`Delete the payment record for ${p.orderId}? This cannot be undone.`)) {
      deletePayment(p.id);
      showToast('Payment deleted', 'success');
    }
  };

  return (
    <div className="w-full">
      <Header
        title="Payments"
        subtitle="All money received, by method and status"
        actions={
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Record payment</span>
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Collected" value={money(revenue)} icon={DollarSign} hint="Completed payments, all time" />
          <StatCard label="Completed payments" value={completed.length} icon={CheckCircle} hint={`${payments.length} payments recorded`} />
          <StatCard label="Pending" value={pending.length} icon={Clock} hint={pending.length ? `${money(pending.reduce((s, p) => s + p.amount, 0))} outstanding` : 'Nothing outstanding'} />
        </div>

        {byMethod.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#252422]">Collected by method</h2>
            <div className="flex h-3 overflow-hidden rounded-full bg-[#ccc5b9]/30" aria-hidden>
              {byMethod.map(([m, v], i) => (
                <div key={m} style={{ width: `${(v / revenue) * 100}%`, opacity: 1 - i * 0.15 }} className="bg-[#eb5e28]" />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#403d39]">
              {byMethod.map(([m, v]) => (
                <li key={m}>
                  <span className="font-medium text-[#252422]">{m}</span> {money(v)} ({((v / revenue) * 100).toFixed(0)}%)
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/60" aria-hidden />
            <input
              type="search"
              aria-label="Search payments"
              placeholder="Search order #, customer, phone or amount…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#ccc5b9] bg-white py-2 pl-10 pr-4 text-sm text-[#252422] placeholder-[#403d39]/50 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className={controlCls}>
              <option value="all">All statuses</option>
              {['Completed', 'Pending', 'Failed', 'Refunded'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Method" value={filterMethod} onChange={e => setFilterMethod(e.target.value as typeof filterMethod)} className={controlCls}>
              <option value="all">All methods</option>
              {['Cash', 'Credit Card', 'Digital Wallet', 'Bank Transfer', 'Check'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={controlCls}>
              <option value="date">Newest first</option>
              <option value="amount">Highest amount</option>
              <option value="name">Customer A–Z</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => exportData('csv', 'payments')} disabled={!payments.length}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[#ccc5b9]/40 bg-[#fffcf2]/60 text-left text-sm font-semibold text-[#252422]">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[#ccc5b9]/20 text-sm transition-colors hover:bg-[#ccc5b9]/10">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#252422]">{p.orderId}</p>
                      {p.notes && <p className="max-w-[180px] truncate text-xs text-[#403d39]/70" title={p.notes}>{p.notes}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[#252422]">{p.customerName || 'Walk-in'}</p>
                      {p.phoneNumber && <p className="text-xs text-[#403d39]/70">{p.phoneNumber}</p>}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-[#eb5e28]">{money(p.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${methodColor[p.method] || methodColor.Check}`}>{p.method}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-[#403d39]">{p.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {(p.status === 'Pending' || p.status === 'Failed') && (
                          <button type="button" onClick={() => setStatus(p, 'Completed')} title="Mark as paid" aria-label={`Mark ${p.orderId} paid`} className="rounded p-2 text-green-700 hover:bg-green-50">
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {p.status === 'Completed' && (
                          <button type="button" onClick={() => setStatus(p, 'Refunded')} title="Refund" aria-label={`Refund ${p.orderId}`} className="rounded p-2 text-yellow-700 hover:bg-yellow-50">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => handleDelete(p)} title="Delete" aria-label={`Delete ${p.orderId}`} className="rounded p-2 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {ready && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#403d39]">
                      {payments.length === 0 ? 'No payments yet. Register sales are recorded here automatically.' : 'No payments match these filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showAdd && (
        <AddPaymentModal isOpen onClose={() => setShowAdd(false)} onAdded={p => showToast(`Payment ${p.orderId} recorded`, 'success')} />
      )}
    </div>
  );
}
