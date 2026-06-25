'use client';

import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Sale {
  id: number;
  total: number;
  date: string;
  timestamp: number;
  createdAt: number;
}

const getRevenueData = (sales: Sale[], period: '24hours' | '7days' | 'month' | '6months' | 'alltime') => {
  const now = new Date();
  let startDate = new Date();
  let labels: string[] = [];
  let groupedData: { [key: string]: number } = {};

  if (period === '24hours') {
    startDate.setHours(startDate.getHours() - 24);
    for (let i = 0; i < 6; i++) {
      const hour = Math.floor(i * 4);
      const label = `${hour === 0 ? '12' : hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`;
      labels.push(label);
      groupedData[label] = 0;
    }
    labels.push('Now');
    groupedData['Now'] = 0;

    sales.forEach((sale) => {
      if (sale.createdAt >= startDate.getTime()) {
        const saleDate = new Date(sale.createdAt);
        const hour = Math.floor(saleDate.getHours() / 4) * 4;
        const label = `${hour === 0 ? '12' : hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`;
        groupedData[label] = (groupedData[label] || 0) + sale.total;
      }
    });
  } else if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const label = dayNames[date.getDay()];
      labels.push(label);
      groupedData[label] = 0;
    }

    sales.forEach((sale) => {
      if (sale.createdAt >= startDate.getTime()) {
        const saleDate = new Date(sale.createdAt);
        const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][saleDate.getDay()];
        groupedData[label] = (groupedData[label] || 0) + sale.total;
      }
    });
  } else if (period === 'month') {
    startDate.setDate(1);
    const weeksInMonth = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    for (let i = 0; i < weeksInMonth; i++) {
      labels.push(`Week ${i + 1}`);
      groupedData[`Week ${i + 1}`] = 0;
    }

    sales.forEach((sale) => {
      if (sale.createdAt >= startDate.getTime() && sale.createdAt <= now.getTime()) {
        const saleDate = new Date(sale.createdAt);
        const week = Math.floor((saleDate.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7) + 1;
        const label = `Week ${week}`;
        groupedData[label] = (groupedData[label] || 0) + sale.total;
      }
    });
  } else if (period === '6months') {
    startDate.setMonth(startDate.getMonth() - 6);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      labels.push(monthNames[date.getMonth()]);
      groupedData[monthNames[date.getMonth()]] = 0;
    }

    sales.forEach((sale) => {
      if (sale.createdAt >= startDate.getTime()) {
        const saleDate = new Date(sale.createdAt);
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][saleDate.getMonth()];
        groupedData[monthName] = (groupedData[monthName] || 0) + sale.total;
      }
    });
  } else {
    // alltime
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach((month) => {
      labels.push(month);
      groupedData[month] = 0;
    });

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const monthName = monthNames[saleDate.getMonth()];
      groupedData[monthName] = (groupedData[monthName] || 0) + sale.total;
    });
  }

  const data = labels.map((label) => groupedData[label] || 0);
  return { labels, data };
};

export default function RevenueTrendChart({ heading, sales = [] }: { heading: string; sales?: Sale[] }) {
  const [timePeriod, setTimePeriod] = useState<'24hours' | '7days' | 'month' | '6months' | 'alltime'>('alltime');

  const chartDatasets = useMemo(() => {
    return getRevenueData(sales, timePeriod);
  }, [sales, timePeriod]);

  const data = {
    labels: chartDatasets.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: chartDatasets.data,
        borderColor: '#eb5e28',
        backgroundColor: 'rgba(235, 94, 40, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#eb5e28',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
    ],
  };

  const maxRevenue = Math.max(...chartDatasets.data, 50000);

  const options = {
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxRevenue * 1.1,
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
      x: {
        ticks: {
          color: '#403d39',
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
