'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import StatCard from '@/components/stat-card';
import AddPaymentModal from '@/components/add-payment-modal';
import { CreditCard, Plus, DollarSign, CheckCircle, Clock, Search, ChevronDown } from 'lucide-react';
import { usePayments } from '@/app/payments/context';

export default function Payments() {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending' | 'Failed' | 'Refunded'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { payments, deletePayment, updatePayment, getTotalRevenue, getPaymentsByStatus } = usePayments();

  // Filter payments based on search and status
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.orderId.toLowerCase().includes(query) ||
        (p.customerName && p.customerName.toLowerCase().includes(query)) ||
        (p.phoneNumber && p.phoneNumber.includes(query)) ||
        p.amount.toString().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === 'date') {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'amount') {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) =>
        (a.customerName || 'Z').localeCompare(b.customerName || 'Z')
      );
    }

    return sorted;
  }, [payments, searchQuery, sortBy, filterStatus]);

  const completedPayments = getPaymentsByStatus('Completed');
  const pendingPayments = getPaymentsByStatus('Pending');
  const totalRevenue = getTotalRevenue();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'danger';
      case 'Refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return 'bg-blue-100 text-blue-700';
      case 'Cash':
        return 'bg-green-100 text-green-700';
      case 'Digital Wallet':
        return 'bg-purple-100 text-purple-700';
      case 'Bank Transfer':
        return 'bg-orange-100 text-orange-700';
      case 'Check':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
      <Header title="Payments" subtitle="Manage and track all payment transactions" />
      
      <div className="p-6 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            change={{ value: 12, type: 'increase' }}
          />
          <StatCard
            label="Completed Payments"
            value={completedPayments.length.toString()}
            icon={CheckCircle}
            change={{ value: 8, type: 'increase' }}
          />
          <StatCard
            label="Pending Payments"
            value={pendingPayments.length.toString()}
            icon={Clock}
            change={{ value: 2, type: 'decrease' }}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#ccc5b9]" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, phone, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors text-sm"
            />
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] hover:border-[#eb5e28] hover:bg-[#fffcf2]/50 transition-colors whitespace-nowrap font-medium text-sm"
            >
              Sort
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    sortBy === 'date'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Sort by Date (Latest)
                </button>
                <button
                  onClick={() => {
                    setSortBy('amount');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    sortBy === 'amount'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Sort by Amount (Highest)
                </button>
                <button
                  onClick={() => {
                    setSortBy('name');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    sortBy === 'name'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Sort by Customer Name
                </button>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] hover:border-[#eb5e28] hover:bg-[#fffcf2]/50 transition-colors whitespace-nowrap font-medium text-sm"
            >
              Filter
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filterStatus === 'all'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('Completed');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filterStatus === 'Completed'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('Pending');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filterStatus === 'Pending'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('Failed');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filterStatus === 'Failed'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Failed
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('Refunded');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filterStatus === 'Refunded'
                      ? 'bg-[#eb5e28]/10 text-[#eb5e28] font-medium'
                      : 'text-[#252422] hover:bg-[#fffcf2]'
                  }`}
                >
                  Refunded
                </button>
              </div>
            )}
          </div>

          {/* New Payment Button */}
          <Button 
            variant="primary" 
            size="md"
            onClick={() => setShowAddPaymentModal(true)}
          >
            <Plus className="w-4 h-4" />
            New Payment
          </Button>
        </div>

        {/* Payments Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ccc5b9]/30 bg-[#fffcf2]/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#ccc5b9]/20 hover:bg-[#ccc5b9]/10 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#252422]">{payment.orderId}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-[#252422]">{payment.customerName || 'N/A'}</p>
                          {payment.phoneNumber && (
                            <p className="text-xs text-[#ccc5b9]">{payment.phoneNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#eb5e28]">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.method)}`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#403d39]">{payment.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={getStatusColor(payment.status) as any}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#ccc5b9]">
                      No payments found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Transaction Details */}
        {filteredPayments.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#252422] mb-4">Payment Details</h3>
              <div className="space-y-3">
                {filteredPayments.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-[#fffcf2]/50 border border-[#ccc5b9]/20 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-[#252422]">{payment.orderId}</p>
                        <p className="text-sm text-[#403d39] mt-1">
                          {payment.customerName || 'Walk-in Customer'} {payment.phoneNumber && `• ${payment.phoneNumber}`}
                        </p>
                        <p className="text-xs text-[#ccc5b9] mt-2">{payment.date} • {payment.method}</p>
                        {payment.notes && (
                          <p className="text-xs text-[#403d39] mt-2">Note: {payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-[#eb5e28] text-lg">${payment.amount.toFixed(2)}</p>
                        <Badge variant={getStatusColor(payment.status) as any} className="mt-2">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal 
        isOpen={showAddPaymentModal} 
        onClose={() => setShowAddPaymentModal(false)}
      />
    </div>
  );
}
