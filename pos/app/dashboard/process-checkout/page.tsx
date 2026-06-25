'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Check } from 'lucide-react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import { useCheckout } from '@/app/dashboard/checkout-context';
import { usePayments } from '@/app/payments/context';
import { useSales } from '@/app/sales/context';
import { useDataManager } from '@/lib';

export default function ProcessCheckout() {
  const router = useRouter();
  const { updateProduct } = useDataManager();
  const { checkoutData, updateCustomerInfo, clearCheckout } = useCheckout();
  const { addPayment } = usePayments();
  const { addSale } = useSales();

  const [customerName, setCustomerName] = useState(checkoutData?.customerName || '');
  const [phoneNumber, setPhoneNumber] = useState(checkoutData?.phoneNumber || '');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  if (!checkoutData) {
    return (
      <div className="w-full">
        <Header title="Checkout" subtitle="Process your sale" />
        <div className="p-6">
          <Card className="p-8 text-center">
            <p className="text-[#ccc5b9] mb-4">No items in checkout. Please add items from the dashboard.</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const orderId = `#${1000 + Math.floor(Math.random() * 9000)}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const invoiceTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleGenerateInvoice = () => {
    // Update customer info
    updateCustomerInfo(customerName, phoneNumber);

    // Create payment record
    addPayment({
      orderId,
      amount: checkoutData.totalAmount,
      method: 'Cash',
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      customerName: customerName || undefined,
      phoneNumber: phoneNumber || undefined,
      notes: `Items: ${checkoutData.items.length}`,
    });

    // Create sale record
    addSale({
      orderId,
      customer: customerName || 'Walk-in Customer',
      items: checkoutData.items.length,
      total: checkoutData.totalAmount,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      status: 'Completed',
      phoneNumber: phoneNumber || undefined,
      saleItems: checkoutData.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.subtotal,
      })),
    });

 checkoutData.items.forEach(item => {
    updateProduct(item.product.id, {
      quantity: item.product.quantity - item.quantity,
    });
  });

    // Generate invoice data
    const invoice = {
      orderId,
      invoiceDate,
      invoiceTime,
      customerName: customerName || 'Walk-in Customer',
      phoneNumber: phoneNumber || 'N/A',
      items: checkoutData.items,
      subtotal: checkoutData.totalAmount,
      tax: 0, // Can be calculated if needed
      total: checkoutData.totalAmount,
    };

    setInvoiceData(invoice);
    setInvoiceGenerated(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleBackToDashboard = () => {
    clearCheckout();
    router.push('/dashboard');
  };

  return (
    <div className="w-full">
      <Header title="Checkout" subtitle="Process your sale and generate invoice" />

      <div className="p-6 max-w-4xl mx-auto">
        {!invoiceGenerated ? (
          // Checkout Form
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#252422] mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {checkoutData.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start pb-3 border-b border-[#ccc5b9]/20">
                    <div className="flex-1">
                      <p className="font-medium text-[#252422]">{item.product.name}</p>
                      <p className="text-sm text-[#ccc5b9]">SKU: {item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#403d39]">Qty: {item.quantity}</p>
                      <p className="font-semibold text-[#eb5e28]">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#ccc5b9]/30 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#252422]">Total Amount:</span>
                  <span className="text-2xl font-bold text-[#eb5e28]">${checkoutData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#252422] mb-4">Customer Information (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#252422] mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
                  />
                  <p className="text-xs text-[#ccc5b9] mt-1">Optional - Defaults to "Walk-in Customer"</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#252422] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
                  />
                  <p className="text-xs text-[#ccc5b9] mt-1">Optional - For customer reference</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleGenerateInvoice}
              >
                Generate Invoice
              </Button>
            </div>
          </div>
        ) : invoiceData ? (
          // Invoice Display
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Invoice generated successfully! Payment recorded.</span>
            </div>

            {/* Invoice */}
            <Card className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#252422] mb-2">INVOICE</h1>
                <p className="text-[#ccc5b9]">TOSPOS - Modern Point of Sale System</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Order Details */}
                <div>
                  <p className="text-sm text-[#ccc5b9] mb-1">Order ID</p>
                  <p className="font-semibold text-[#252422]">{invoiceData.orderId}</p>

                  <p className="text-sm text-[#ccc5b9] mt-4 mb-1">Date</p>
                  <p className="font-semibold text-[#252422]">{invoiceData.invoiceDate}</p>

                  <p className="text-sm text-[#ccc5b9] mt-4 mb-1">Time</p>
                  <p className="font-semibold text-[#252422]">{invoiceData.invoiceTime}</p>
                </div>

                {/* Customer Details */}
                <div>
                  <p className="text-sm text-[#ccc5b9] mb-1">Customer Name</p>
                  <p className="font-semibold text-[#252422]">{invoiceData.customerName}</p>

                  <p className="text-sm text-[#ccc5b9] mt-4 mb-1">Phone Number</p>
                  <p className="font-semibold text-[#252422]">{invoiceData.phoneNumber}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#252422]">
                      <th className="text-left py-2 text-sm font-semibold text-[#252422]">Item</th>
                      <th className="text-right py-2 text-sm font-semibold text-[#252422]">Qty</th>
                      <th className="text-right py-2 text-sm font-semibold text-[#252422]">Unit Price</th>
                      <th className="text-right py-2 text-sm font-semibold text-[#252422]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item: any) => (
                      <tr key={item.product.id} className="border-b border-[#ccc5b9]/30">
                        <td className="py-3 text-[#252422]">{item.product.name}</td>
                        <td className="text-right py-3 text-[#252422]">{item.quantity}</td>
                        <td className="text-right py-3 text-[#252422]">${item.product.price.toFixed(2)}</td>
                        <td className="text-right py-3 font-semibold text-[#252422]">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-[#252422] pt-4 mb-8">
                <div className="flex justify-end mb-3">
                  <div className="w-64">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#403d39]">Subtotal:</span>
                      <span className="text-[#252422]">${invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-[#403d39]">Tax:</span>
                      <span className="text-[#252422]">${invoiceData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#252422] pt-2">
                      <span className="font-bold text-[#252422]">Total:</span>
                      <span className="font-bold text-xl text-[#eb5e28]">${invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t border-[#ccc5b9]/30 pt-4">
                <p className="text-xs text-[#ccc5b9]">Thank you for your purchase!</p>
                <p className="text-xs text-[#ccc5b9] mt-1">Please keep this invoice for your records.</p>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handlePrintInvoice}
              >
                <Download className="w-4 h-4" />
                Print Invoice
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * {
            display: none;
          }
          .print-section {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
