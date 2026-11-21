'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import StatCard from '@/components/stat-card';
import Modal from '@/components/modal';
import Receipt from '@/components/receipt';
import { ShoppingCart, Plus, TrendingUp, Search, Receipt as ReceiptIcon, Download, RotateCcw, Printer, Trash2 } from 'lucide-react';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import { todayISO } from '@/lib/storage/database';
import type { Sale } from '@/lib/storage/types';

type Range = 'today' | '7d' | '30d' | 'all';
const controlCls =
  'rounded-lg border border-[#ccc5b9] bg-white px-3 py-2 text-sm text-[#252422] focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

function pctChange(current: number, previous: number) {
  if (previous <= 0) return undefined;
  const v = ((current - previous) / previous) * 100;
  return { value: v, type: v >= 0 ? ('increase' as const) : ('decrease' as const), label: 'vs yesterday' };
}

export default function Sales() {
  const router = useRouter();
  const money = useMoney();
  const { showToast } = useToast();
  const { sales, refundSale, deleteSale, exportData, ready } = useDataManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'customer'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Cancelled'>('all');
  const [range, setRange] = useState<Range>('all');
  const [selected, setSelected] = useState<Sale | null>(null);
  const [now] = useState(() => Date.now());

  const kpis = useMemo(() => {
    const today = todayISO();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = todayISO(y);
    const done = sales.filter(s => s.status === 'Completed');
    const t = done.filter(s => s.date === today);
    const yd = done.filter(s => s.date === yesterday);
    const sum = (l: Sale[]) => l.reduce((a, s) => a + s.total, 0);
    return {
      todayRevenue: sum(t),
      todayCount: t.length,
      revenueChange: pctChange(sum(t), sum(yd)),
      countChange: pctChange(t.length, yd.length),
      aov: done.length ? sum(done) / done.length : 0,
    };
  }, [sales]);

  const filteredSales = useMemo(() => {
    const cutoff: Record<Range, number> = {
      today: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
      '7d': now - 7 * 864e5,
      '30d': now - 30 * 864e5,
      all: 0,
    };
    const q = searchQuery.trim().toLowerCase();
    const list = sales.filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if ((s.timestamp || s.createdAt) < cutoff[range]) return false;
      if (!q) return true;
      return (
        s.orderId.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        (s.phoneNumber || '').includes(q) ||
        s.saleItems.some(i => i.name.toLowerCase().includes(q))
      );
    });
    const sorted = [...list];
    if (sortBy === 'date') sorted.sort((a, b) => (b.timestamp || b.createdAt) - (a.timestamp || a.createdAt));
    if (sortBy === 'total') sorted.sort((a, b) => b.total - a.total);
    if (sortBy === 'customer') sorted.sort((a, b) => a.customer.localeCompare(b.customer));
    return sorted;
  }, [sales, searchQuery, sortBy, filterStatus, range, now]);

  const filteredTotal = filteredSales.filter(s => s.status === 'Completed').reduce((a, s) => a + s.total, 0);

  const handleRefund = (sale: Sale) => {
    if (!confirm(`Refund order ${sale.orderId} for ${money(sale.total)}? Items will be returned to stock.`)) return;
    const r = refundSale(sale.id);
    if (r.ok) {
      showToast(`Order ${sale.orderId} refunded`, 'success');
      setSelected(null);
    } else showToast(r.error || 'Refund failed', 'error');
  };

  const handleDelete = (sale: Sale) => {
    if (!confirm(`Permanently delete the record of order ${sale.orderId}? This does not change stock. Use Refund to reverse a sale.`)) return;
    deleteSale(sale.id);
    setSelected(null);
    showToast(`Order ${sale.orderId} deleted`, 'success');
  };

  return (
    <>
      <div className="w-full">
        <Header
          title="Sales"
          subtitle="Every transaction rung up at the register"
          actions={
            <Button size="sm" onClick={() => router.push('/dashboard')}>
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New sale</span>
            </Button>
          }
        />

        <div className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard icon={ShoppingCart} label="Revenue today" value={money(kpis.todayRevenue)} change={kpis.revenueChange} hint="Completed sales only" />
            <StatCard icon={TrendingUp} label="Transactions today" value={kpis.todayCount} change={kpis.countChange} hint={`${sales.length} all time`} />
            <StatCard icon={ReceiptIcon} label="Average order value" value={money(kpis.aov)} hint="All completed sales" />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#403d39]/60" aria-hidden />
              <input
                type="search"
                aria-label="Search sales"
                placeholder="Search order #, customer, phone or product…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#ccc5b9] bg-white py-2 pl-10 pr-4 text-[#252422] placeholder-[#403d39]/50 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select aria-label="Date range" value={range} onChange={e => setRange(e.target.value as Range)} className={controlCls}>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <select aria-label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className={controlCls}>
                <option value="all">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Refunded</option>
              </select>
              <select aria-label="Sort by" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={controlCls}>
                <option value="date">Newest first</option>
                <option value="total">Highest amount</option>
                <option value="customer">Customer A–Z</option>
              </select>
              <Button variant="ghost" size="sm" onClick={() => exportData('csv', 'sales')} disabled={!sales.length}>
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
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3 text-right">Items</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(sale => {
                    const when = new Date(sale.timestamp || sale.createdAt);
                    return (
                      <tr key={sale.id} className="border-b border-[#ccc5b9]/20 text-sm transition-colors hover:bg-[#ccc5b9]/10">
                        <td className="px-5 py-3 font-medium text-[#252422]">{sale.orderId}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-[#403d39]">
                          {when.toLocaleDateString()} <span className="text-xs text-[#403d39]/60">{when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="px-5 py-3 text-[#252422]">{sale.customer}</td>
                        <td className="px-5 py-3 text-right text-[#403d39]">{sale.items}</td>
                        <td className="px-5 py-3 text-[#403d39]">{sale.paymentMethod || '—'}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${sale.status === 'Cancelled' ? 'text-[#403d39]/60 line-through' : 'text-[#252422]'}`}>{money(sale.total)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={sale.status === 'Completed' ? 'success' : sale.status === 'Cancelled' ? 'danger' : 'info'}>
                            {sale.status === 'Cancelled' ? 'Refunded' : sale.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => setSelected(sale)} title="View receipt" aria-label={`View receipt ${sale.orderId}`} className="rounded p-2 text-[#403d39] hover:bg-[#ccc5b9]/30">
                              <ReceiptIcon className="h-4 w-4" />
                            </button>
                            {sale.status === 'Completed' && (
                              <button type="button" onClick={() => handleRefund(sale)} title="Refund" aria-label={`Refund ${sale.orderId}`} className="rounded p-2 text-yellow-700 hover:bg-yellow-50">
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {ready && filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[#403d39]">
                        {sales.length === 0 ? 'No sales yet. Completed checkouts appear here.' : 'No sales match these filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
                {filteredSales.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#fffcf2]/60 text-sm">
                      <td colSpan={5} className="px-5 py-3 text-[#403d39]">{filteredSales.length} order(s) shown</td>
                      <td className="px-5 py-3 text-right font-bold text-[#252422]">{money(filteredTotal)}</td>
                      <td colSpan={2} className="px-5 py-3 text-xs text-[#403d39]/70">excl. refunds</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Order ${selected.orderId}` : ''}
        size="md"
        footer={
          selected && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(selected)} className="mr-auto text-red-600">
                <Trash2 className="h-4 w-4" /> Delete record
              </Button>
              {selected.status === 'Completed' && (
                <Button variant="ghost" size="sm" onClick={() => handleRefund(selected)}>
                  <RotateCcw className="h-4 w-4" /> Refund
                </Button>
              )}
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </>
          )
        }
      >
        {selected && <Receipt sale={selected} />}
      </Modal>
    </>
  );
}
