'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import StatCard from '@/components/stat-card';
import { ShoppingCart, Plus, TrendingUp, Search, ChevronDown, Trash2, Eye } from 'lucide-react';
import { useSales } from '@/app/sales/context';

export default function Sales() {
  const { sales, deleteSale } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'customer'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Processing'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<number | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<any>(null);

  const handleDeleteSale = (id: number) => {
    deleteSale(id);
    setExpandedActionId(null);
  };

  const handleViewDetails = (sale: any) => {
    setSelectedSaleForInvoice(sale);
    setShowInvoiceModal(true);
    setExpandedActionId(null);
  };

  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.orderId.toLowerCase().includes(query) ||
        s.customer.toLowerCase().includes(query) ||
        s.total.toString().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === 'date') {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'total') {
      sorted.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'customer') {
      sorted.sort((a, b) => a.customer.localeCompare(b.customer));
    }

    return sorted;
  }, [sales, searchQuery, sortBy, filterStatus]);

  return (
    <>
    <div className="w-full">
        <Header title="Sales" subtitle="Track and manage all sales transactions" />
        
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              icon={ShoppingCart}
              label="Total Sales Today"
              value={`$${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}`}
              change={{ value: 15, type: 'increase' }}
            />
            <StatCard
              icon={TrendingUp}
              label="Transactions"
              value={sales.length.toString()}
              change={{ value: 8, type: 'increase' }}
            />
            <StatCard
              icon={ShoppingCart}
              label="Avg. Order Value"
              value={sales.length > 0 ? `$${(sales.reduce((sum, s) => sum + s.total, 0) / sales.length).toFixed(2)}` : '$0.00'}
              change={{ value: 2, type: 'decrease' }}
            />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-[#403d39]" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] placeholder-[#403d39] focus:outline-none focus:border-[#eb5e28]"
                />
              </div>

              {/* Sort Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="px-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] hover:bg-[#ccc5b9]/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Sort
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSortBy('date');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${sortBy === 'date' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      Date (Latest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('total');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${sortBy === 'total' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      Amount (Highest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('customer');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors ${sortBy === 'customer' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      Customer Name
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="px-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] hover:bg-[#ccc5b9]/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Filter
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${filterStatus === 'all' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('Completed');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${filterStatus === 'Completed' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('Processing');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors ${filterStatus === 'Processing' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                    >
                      Processing
                    </button>
                  </div>
                )}
              </div>

              <Button variant="primary" size="md">
                <Plus className="w-4 h-4" />
                New Sale
              </Button>
            </div>
          </div>

          {/* Sales Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ccc5b9]/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]\">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-[#ccc5b9]/20 hover:bg-[#ccc5b9]/10 transition-colors">
                        <td className="px-6 py-4 text-sm text-[#252422]">{sale.orderId}</td>
                        <td className="px-6 py-4 text-sm text-[#252422]">{sale.customer}</td>
                        <td className="px-6 py-4 text-sm text-[#403d39]">{sale.items}</td>
                        <td className="px-6 py-4 text-sm text-[#252422] font-semibold">${sale.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-[#403d39]">{sale.date}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={sale.status === 'Completed' ? 'success' : 'info'}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="relative">
                            <button
                              onClick={() => setExpandedActionId(expandedActionId === sale.id ? null : sale.id)}
                              className="px-3 py-1 text-xs font-medium text-[#eb5e28] hover:bg-[#eb5e28]/10 rounded transition-colors"
                            >
                              Action
                            </button>
                            {expandedActionId === sale.id && (
                              <div className="absolute top-full right-0 mt-1 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-20 min-w-[120px]">
                                <button
                                  onClick={() => handleViewDetails(sale)}
                                  className="w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 text-[#252422] flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Details
                                </button>
                                <button
                                  onClick={() => handleDeleteSale(sale.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-100 transition-colors text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[#ccc5b9]">
                        No sales found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedSaleForInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#252422]">INVOICE</h1>
                  <p className="text-[#403d39]">{selectedSaleForInvoice.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#403d39]">Date: {selectedSaleForInvoice.date}</p>
                  <Badge variant={selectedSaleForInvoice.status === 'Completed' ? 'success' : 'info'}>
                    {selectedSaleForInvoice.status}
                  </Badge>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-8 pb-8 border-b border-[#ccc5b9]/30">
                <h2 className="text-sm font-semibold text-[#252422] mb-2">BILL TO:</h2>
                <p className="text-lg font-semibold text-[#252422]">{selectedSaleForInvoice.customer}</p>
                {selectedSaleForInvoice.phoneNumber && (
                  <p className="text-sm text-[#403d39] mt-1">Phone: {selectedSaleForInvoice.phoneNumber}</p>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b border-[#ccc5b9]/30">
                      <th className="text-left py-2 px-2 font-semibold text-[#252422]">Item</th>
                      <th className="text-right py-2 px-2 font-semibold text-[#252422]">Quantity</th>
                      <th className="text-right py-2 px-2 font-semibold text-[#252422]">Unit Price</th>
                      <th className="text-right py-2 px-2 font-semibold text-[#252422]">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSaleForInvoice.saleItems.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-[#ccc5b9]/20">
                        <td className="py-3 px-2 text-[#252422]">{item.name}</td>
                        <td className="text-right py-3 px-2 text-[#403d39]">{item.quantity}</td>
                        <td className="text-right py-3 px-2 text-[#403d39]">${item.price.toFixed(2)}</td>
                        <td className="text-right py-3 px-2 font-semibold text-[#252422]">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-2 px-4 bg-[#ccc5b9]/10 rounded">
                      <span className="font-semibold text-[#252422]">Total Amount:</span>
                      <span className="font-bold text-[#eb5e28] text-lg">${selectedSaleForInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#ccc5b9]/30 pt-6 mb-6 text-center text-sm text-[#403d39]">
                <p>Thank you for your business!</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="ghost" 
                  size="md"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
