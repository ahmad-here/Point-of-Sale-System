'use client';

import Header from '@/components/header';
import ProductEntry from '@/components/product-entry';
import { useDataManager, useMoney } from '@/lib/storage';
import { todayISO } from '@/lib/storage/database';

export default function Dashboard() {
  const { sales, settings } = useDataManager();
  const money = useMoney();
  const today = todayISO();
  const todays = sales.filter(s => s.date === today && s.status === 'Completed');
  const revenue = todays.reduce((s, x) => s + x.total, 0);

  return (
    <div className="w-full">
      <Header
        title="Register"
        subtitle={`${settings.businessName} · Today: ${todays.length} sale(s), ${money(revenue)}`}
      />
      <ProductEntry />
    </div>
  );
}
