'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Card from '@/components/card';
import StatCard from '@/components/stat-card';
import RevenueTrendChart from '@/components/revenue-trend-chart';
import SalesByCategoryChart from '@/components/sales-by-category-chart';
import { BarChart3, ShoppingBag, Activity, RotateCcw } from 'lucide-react';
import { useDataManager, useMoney } from '@/lib/storage';

const DAY = 864e5;

function change(cur: number, prev: number) {
  if (prev <= 0) return undefined;
  const v = ((cur - prev) / prev) * 100;
  return { value: v, type: v >= 0 ? ('increase' as const) : ('decrease' as const), label: 'vs prior 30 days' };
}

export default function Analytics() {
  const money = useMoney();
  const { sales, products, categories } = useDataManager();

  // Reference time fixed at mount keeps renders pure
  const [now] = useState(() => Date.now());
  const completed = useMemo(() => sales.filter(s => s.status === 'Completed'), [sales]);

  const m = useMemo(() => {
    const ts = (s: (typeof sales)[number]) => s.timestamp || s.createdAt;
    const cur = completed.filter(s => ts(s) >= now - 30 * DAY);
    const prev = completed.filter(s => ts(s) < now - 30 * DAY && ts(s) >= now - 60 * DAY);
    const sum = (l: typeof completed) => l.reduce((a, s) => a + s.total, 0);
    const units = (l: typeof completed) => l.reduce((a, s) => a + s.saleItems.reduce((b, i) => b + i.quantity, 0), 0);
    const refunded = sales.filter(s => s.status === 'Cancelled' && ts(s) >= now - 30 * DAY);

    // Best sellers (all time) by revenue, keyed on product id when available
    const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
    completed.forEach(s =>
      s.saleItems.forEach(i => {
        const key = i.productId !== undefined ? `id:${i.productId}` : `n:${i.name}`;
        const e = byProduct.get(key) || { name: i.name, qty: 0, revenue: 0 };
        e.qty += i.quantity;
        e.revenue += i.subtotal;
        byProduct.set(key, e);
      })
    );
    const top = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Revenue by category
    const catRevenue = new Map<string, number>();
    completed.forEach(s =>
      s.saleItems.forEach(i => {
        const p = products.find(pr => (i.productId !== undefined ? pr.id === i.productId : pr.name === i.name));
        const cat = p ? categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized' : 'Deleted products';
        catRevenue.set(cat, (catRevenue.get(cat) || 0) + i.subtotal);
      })
    );
    const totalCat = [...catRevenue.values()].reduce((a, b) => a + b, 0);
    const cats = [...catRevenue.entries()].sort((a, b) => b[1] - a[1]);

    // Busiest hours
    const hours = Array(24).fill(0) as number[];
    completed.forEach(s => (hours[new Date(ts(s)).getHours()] += 1));
    const peakHour = hours.indexOf(Math.max(...hours));

    return {
      revenue30: sum(cur),
      revenueChange: change(sum(cur), sum(prev)),
      orders30: cur.length,
      ordersChange: change(cur.length, prev.length),
      aov30: cur.length ? sum(cur) / cur.length : 0,
      aovChange: change(cur.length ? sum(cur) / cur.length : 0, prev.length ? sum(prev) / prev.length : 0),
      units30: units(cur),
      refundCount: refunded.length,
      refundRate: cur.length + refunded.length ? (refunded.length / (cur.length + refunded.length)) * 100 : 0,
      top,
      cats,
      totalCat,
      hours,
      peakHour,
    };
  }, [completed, sales, products, categories, now]);

  const fmtHour = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: 'numeric' });
  const maxHour = Math.max(...m.hours, 1);

  return (
    <div className="w-full">
      <Header title="Analytics" subtitle="Performance over the last 30 days (refunds excluded)" />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} label="Revenue (30 days)" value={money(m.revenue30)} change={m.revenueChange} hint="No prior period to compare" />
          <StatCard icon={ShoppingBag} label="Orders (30 days)" value={m.orders30} change={m.ordersChange} hint={`${m.units30} units sold`} />
          <StatCard icon={Activity} label="Avg. order value" value={money(m.aov30)} change={m.aovChange} hint="Last 30 days" />
          <StatCard icon={RotateCcw} label="Refund rate" value={`${m.refundRate.toFixed(1)}%`} hint={`${m.refundCount} refund(s) in 30 days`} />
        </div>

        {completed.length === 0 && (
          <Card className="p-6 text-center text-[#403d39]">
            Analytics fill in as you make sales. <Link href="/dashboard" className="font-medium text-[#eb5e28] underline">Open the register</Link> to ring up your first order.
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <RevenueTrendChart heading="Revenue trend" sales={completed} formatMoney={money} />
          </Card>
          <Card className="p-5 sm:p-6">
            <SalesByCategoryChart heading="Top products by revenue" sales={completed} formatMoney={money} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#252422]">Best sellers</h3>
            {m.top.length === 0 ? (
              <p className="text-sm text-[#403d39]">No sales yet.</p>
            ) : (
              <ol className="space-y-3">
                {m.top.map((p, i) => (
                  <li key={p.name + i} className="flex items-center gap-3 border-b border-[#ccc5b9]/30 pb-2 last:border-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eb5e28]/15 text-xs font-bold text-[#eb5e28]">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#252422]">{p.name}</span>
                      <span className="text-xs text-[#403d39]/70">{p.qty} sold</span>
                    </span>
                    <span className="text-sm font-semibold text-[#eb5e28]">{money(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#252422]">Revenue by category</h3>
            {m.cats.length === 0 ? (
              <p className="text-sm text-[#403d39]">No sales yet.</p>
            ) : (
              <ul className="space-y-3">
                {m.cats.map(([name, v]) => (
                  <li key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-[#252422]">{name}</span>
                      <span className="text-[#403d39]">{money(v)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#ccc5b9]/30">
                      <div className="h-2 rounded-full bg-[#eb5e28]" style={{ width: `${(v / m.totalCat) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="mb-1 text-lg font-semibold text-[#252422]">Busiest hours</h3>
            <p className="mb-4 text-sm text-[#403d39]">
              {completed.length ? `Peak: ${fmtHour(m.peakHour)} – ${fmtHour((m.peakHour + 1) % 24)}` : 'Based on all completed sales'}
            </p>
            <div className="flex h-32 items-end gap-[2px]" role="img" aria-label="Orders by hour of day">
              {m.hours.map((c, h) => (
                <div key={h} title={`${fmtHour(h)}: ${c} order(s)`} className="flex-1 rounded-t bg-[#eb5e28]" style={{ height: `${(c / maxHour) * 100}%`, minHeight: c ? 4 : 1, opacity: c ? 1 : 0.2 }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[#403d39]/70">
              <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
