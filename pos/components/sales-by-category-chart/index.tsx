'use client';

import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  id: number;
  category: string;
}

interface SaleItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: number;
  saleItems: SaleItem[];
  createdAt: number;
}

const getCategoryData = (sales: Sale[], period: '24hours' | '7days' | 'month' | '6months' | 'alltime') => {
  const now = new Date();
  let startDate = new Date();
  let categoryRevenue: { [key: string]: number } = {};

  if (period === '24hours') {
    startDate.setHours(startDate.getHours() - 24);
  } else if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === '6months') {
    startDate.setMonth(startDate.getMonth() - 6);
  } else {
    // alltime - set to beginning of current year
    startDate.setFullYear(startDate.getFullYear() - 10);
  }

  sales.forEach((sale) => {
    if (sale.createdAt >= startDate.getTime()) {
      sale.saleItems.forEach((item) => {
        const category = item.name || 'Uncategorized';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.subtotal;
      });
    }
  });

  const sortedCategories = Object.entries(categoryRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sortedCategories.map((c) => c[0]);
  const data = sortedCategories.map((c) => c[1]);

  return { labels, data };
};

export default function SalesByCategoryChart({
  heading,
  sales = [],
}: {
  heading: string;
  sales?: Sale[];
}) {
  const [timePeriod, setTimePeriod] = useState<'24hours' | '7days' | 'month' | '6months' | 'alltime'>(
    'alltime'
  );

  const chartDatasets = useMemo(() => {
    return getCategoryData(sales, timePeriod);
  }, [sales, timePeriod]);

  const data = {
    labels: chartDatasets.labels,
    datasets: [
      {
        label: 'Sales ($)',
        data: chartDatasets.data,
        backgroundColor: [
          '#eb5e28',
          '#f77f00',
          '#fcbf49',
          '#ee964b',
          '#d62828',
          '#c4282f',
        ],
        borderColor: '#252422',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const maxSales = Math.max(...chartDatasets.data, 25000);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#403d39',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(37, 36, 34, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#eb5e28',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return '$' + (context.parsed.x as number).toLocaleString();
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: maxSales * 1.1,
        ticks: {
          color: '#403d39',
          callback: function (value: number | string) {
            return '$' + (value as number).toLocaleString();
          },
        },
        grid: {
          color: 'rgba(204, 197, 185, 0.1)',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#403d39',
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <h3 className='text-lg font-semibold text-[#252422] mb-4'>{heading}</h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as '24hours' | '7days' | 'month' | '6months' | 'alltime')}
          className="px-4 py-2 bg-white border border-[#ccc5b9] rounded-lg text-[#252422] font-medium text-sm hover:border-[#eb5e28] focus:outline-none focus:ring-2 focus:ring-[#eb5e28] focus:border-transparent"
        >
          <option value="24hours">Past 24 Hours</option>
          <option value="7days">Past 7 Days</option>
          <option value="month">Past Month</option>
          <option value="6months">Past 6 Months</option>
          <option value="alltime">All Time</option>
        </select>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
