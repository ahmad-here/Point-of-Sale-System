'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/button';
import Card from '@/components/card';
import { usePayments, Payment } from '@/app/payments/context';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPaymentModal({ isOpen, onClose }: AddPaymentModalProps) {
  const { addPayment } = usePayments();
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    customerName: '',
    phoneNumber: '',
    method: 'Credit Card' as Payment['method'],
    status: 'Completed' as Payment['status'],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId.trim()) {
      newErrors.orderId = 'Order ID is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newPayment: Omit<Payment, 'id' | 'timestamp'> = {
      orderId: formData.orderId.trim(),
      amount: parseFloat(formData.amount),
      method: formData.method,
      status: formData.status,
      date: new Date().toISOString().split('T')[0],
      customerName: formData.customerName || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      notes: formData.notes || undefined,
    };

    addPayment(newPayment);

    // Reset form and close
    setFormData({
      customerName: '',
      phoneNumber: '',
      orderId: '',
      amount: '',
      method: 'Credit Card',
      status: 'Completed',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#252422]">Add Manual Payment</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#ccc5b9]/20 rounded transition-colors"
            >
              <X className="w-5 h-5 text-[#252422]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Order ID
              </label>
              <input
                type="text"
                placeholder="e.g., #1004"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:ring-1 transition-colors ${
                  errors.orderId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ccc5b9] focus:border-[#eb5e28] focus:ring-[#eb5e28]'
                }`}
              />
              {errors.orderId && <p className="text-xs text-red-600 mt-1">{errors.orderId}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:ring-1 transition-colors ${
                  errors.amount
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ccc5b9] focus:border-[#eb5e28] focus:ring-[#eb5e28]'
                }`}
              />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g., +1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Payment Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as Payment['method'] })}
                className="w-full px-3 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Digital Wallet">Digital Wallet</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
                className="w-full px-3 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#252422] mb-1">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28] transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Add Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
