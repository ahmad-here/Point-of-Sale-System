'use client';

import { useMemo } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import StatCard from '@/components/stat-card';
import RevenueTrendChart from '@/components/revenue-trend-chart';
import SalesByCategoryChart from '@/components/sales-by-category-chart';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { useDataManager } from '@/lib/storage';

export default function Analytics() {
  const { sales, payments, products } = useDataManager();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    const totalProducts = products.length;
    const completedPayments = payments.filter((p) => p.status === 'Completed').length;
    const totalPayments = payments.length;

    const avgTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate growth rate (mock - would compare with previous period in real app)
    const recentSales = sales.filter(
      (s) => s.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const recentRevenue = recentSales.reduce((sum, s) => sum + s.total, 0);
    const previousRevenue = totalRevenue - recentRevenue;
    const growthRate =
      previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Conversion rate (completed payments / total sales)
    const conversionRate = totalSales > 0 ? (completedPayments / totalSales) * 100 : 0;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      growthRate: growthRate.toFixed(1),
      conversionRate: conversionRate.toFixed(2),
      avgTransaction: avgTransaction.toFixed(2),
    };
  }, [sales, payments, products]);

  return (
    <div className="w-full">
      <Header title="Analytics" subtitle="View detailed analytics and performance metrics" />

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={BarChart3}
            label="Total Revenue"
            value={`$${metrics.totalRevenue}`}
            change={{ value: parseFloat(metrics.growthRate), type: parseFloat(metrics.growthRate) >= 0 ? 'increase' : 'decrease' }}
          />
          <StatCard
            icon={TrendingUp}
            label="Growth Rate"
            value={`${metrics.growthRate}%`}
            change={{ value: parseFloat(metrics.growthRate) >= 0 ? 5 : -5, type: parseFloat(metrics.growthRate) >= 0 ? 'increase' : 'decrease' }}
          />
          <StatCard
            icon={PieChart}
            label="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            change={{ value: 0.5, type: 'increase' }}
          />
          <StatCard
            icon={Activity}
            label="Avg. Transaction"
            value={`$${metrics.avgTransaction}`}
            change={{ value: 8, type: 'increase' }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <RevenueTrendChart heading={"Revenue Trend"} sales={sales} />
          </Card>

          <Card className="p-6">
            <SalesByCategoryChart heading={"Sales by Product"} sales={sales} />
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#252422] mb-4">Top Products</h3>
            <div className="space-y-3">
              {products.slice(0, 3).map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between p-2 border-b border-[#ccc5b9]/30">
                  <span className="text-sm text-[#403d39]">{product.name}</span>
                  <span className="text-sm text-[#eb5e28] font-semibold">${product.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
