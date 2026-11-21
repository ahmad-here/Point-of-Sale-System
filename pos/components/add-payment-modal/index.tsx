'use client';

import { useState } from 'react';
import Button from '@/components/button';
import Modal from '@/components/modal';
import { useDataManager } from '@/lib/storage';
import { todayISO } from '@/lib/storage/database';
import type { Payment, PaymentMethod } from '@/lib/storage/types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (p: Payment) => void;
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-[#252422] placeholder-[#403d39]/40 focus:outline-none focus:ring-1 ${
    err ? 'border-red-500 focus:ring-red-500' : 'border-[#ccc5b9] focus:border-[#eb5e28] focus:ring-[#eb5e28]'
  }`;

export default function AddPaymentModal({ isOpen, onClose, onAdded }: AddPaymentModalProps) {
  const { addPayment, nextOrderId, settings } = useDataManager();
  const blank = () => ({
    orderId: '',
    amount: '',
    customerName: '',
    phoneNumber: '',
    method: settings.defaultPaymentMethod as PaymentMethod,
    status: 'Completed' as Payment['status'],
    date: todayISO(),
    notes: '',
  });
  // Parent mounts this modal only while open, so initial state is fresh each time
  const [formData, setFormData] = useState(() => ({ ...blank(), orderId: nextOrderId() }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.orderId.trim()) newErrors.orderId = 'Order ID is required';
    const amount = parseFloat(formData.amount);
    if (Number.isNaN(amount) || amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const ts = new Date(`${formData.date}T${new Date().toTimeString().slice(0, 8)}`).getTime();
    const p = addPayment({
      orderId: formData.orderId.trim(),
      amount: Math.round(amount * 100) / 100,
      method: formData.method,
      status: formData.status,
      date: formData.date,
      timestamp: Number.isNaN(ts) ? Date.now() : ts,
      customerName: formData.customerName.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });
    onAdded?.(p);
    onClose();
  };

  const set = (k: keyof ReturnType<typeof blank>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Record a payment"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-payment-form">Save payment</Button>
        </>
      }
    >
      <form id="add-payment-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-[#403d39]">
          For deposits, invoices paid later or sales made outside the register. Register sales are recorded automatically.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Order / invoice #</span>
            <input value={formData.orderId} onChange={set('orderId')} className={inputCls(errors.orderId)} />
            {errors.orderId && <span className="mt-1 block text-xs text-red-600">{errors.orderId}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Amount ({settings.currency})</span>
            <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" value={formData.amount} onChange={set('amount')} className={inputCls(errors.amount)} autoFocus />
            {errors.amount && <span className="mt-1 block text-xs text-red-600">{errors.amount}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Customer</span>
            <input value={formData.customerName} onChange={set('customerName')} placeholder="Optional" className={inputCls()} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Phone</span>
            <input type="tel" value={formData.phoneNumber} onChange={set('phoneNumber')} placeholder="Optional" className={inputCls()} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Method</span>
            <select value={formData.method} onChange={set('method')} className={inputCls()}>
              {['Cash', 'Credit Card', 'Digital Wallet', 'Bank Transfer', 'Check'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Status</span>
            <select value={formData.status} onChange={set('status')} className={inputCls()}>
              {['Completed', 'Pending', 'Failed', 'Refunded'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Date</span>
            <input type="date" value={formData.date} max={todayISO()} onChange={set('date')} className={inputCls()} />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Notes</span>
            <textarea value={formData.notes} onChange={set('notes')} rows={2} placeholder="Optional" className={`${inputCls()} resize-none`} />
          </label>
        </div>
      </form>
    </Modal>
  );
}
