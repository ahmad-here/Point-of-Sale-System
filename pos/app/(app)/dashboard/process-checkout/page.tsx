'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Check, Banknote, CreditCard, Smartphone, Landmark, FileText, Plus } from 'lucide-react';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Receipt from '@/components/receipt';
import { useCart } from '@/app/(app)/cart-context';
import { useDataManager, useMoney } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
import type { PaymentMethod, Sale } from '@/lib/storage/types';

const METHODS: { value: PaymentMethod; icon: React.ElementType }[] = [
  { value: 'Cash', icon: Banknote },
  { value: 'Credit Card', icon: CreditCard },
  { value: 'Digital Wallet', icon: Smartphone },
  { value: 'Bank Transfer', icon: Landmark },
  { value: 'Check', icon: FileText },
];

const inputCls =
  'w-full rounded-lg border border-[#ccc5b9] bg-white px-4 py-2 text-[#252422] placeholder-[#403d39]/40 focus:border-[#eb5e28] focus:outline-none focus:ring-1 focus:ring-[#eb5e28]';

export default function ProcessCheckout() {
  const router = useRouter();
  const money = useMoney();
  const { showToast } = useToast();
  const { completeSale, settings, ready } = useDataManager();
  const cart = useCart();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // null = use the store's default (which loads from storage after mount)
  const [chosenMethod, setMethod] = useState<PaymentMethod | null>(null);
  const method = chosenMethod ?? settings.defaultPaymentMethod;
  const [discountInput, setDiscountInput] = useState('');
  const [tenderedInput, setTenderedInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Sale | null>(null);

  const totals = useMemo(() => {
    const subtotal = cart.subtotal;
    const discount = Math.min(Math.max(parseFloat(discountInput) || 0, 0), subtotal);
    const tax = Math.round((subtotal - discount) * (settings.taxRate || 0)) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;
    const tendered = parseFloat(tenderedInput);
    const change = !Number.isNaN(tendered) ? Math.round((tendered - total) * 100) / 100 : null;
    return { subtotal, discount, tax, total, tendered, change };
  }, [cart.subtotal, discountInput, tenderedInput, settings.taxRate]);

  const cashShort = method === 'Cash' && tenderedInput !== '' && (totals.change ?? 0) < 0;

  const handleComplete = () => {
    if (submitting) return;
    setSubmitting(true);
    const result = completeSale({
      lines: cart.lines,
      customerName,
      phoneNumber,
      method,
      discount: totals.discount,
      amountTendered: method === 'Cash' && tenderedInput !== '' ? totals.tendered : undefined,
    });
    if (!result.ok) {
      showToast(result.error, 'error', 5000);
      setSubmitting(false);
      return;
    }
    cart.clear();
    setCompleted(result.sale);
    showToast(`Sale ${result.sale.orderId} completed`, 'success');
  };

  const startNewSale = () => router.push('/dashboard');

  if (completed) {
    return (
      <div className="w-full">
        <Header title="Sale complete" subtitle={`Order ${completed.orderId}`} />
        <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
          <div className="no-print flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Payment recorded and inventory updated.
              {completed.change !== undefined && completed.change > 0 && ` Give change: ${money(completed.change)}.`}
            </span>
          </div>
          <Receipt sale={completed} />
          <div className="no-print flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" className="flex-1" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print receipt
            </Button>
            <Button className="flex-1" onClick={startNewSale} autoFocus>
              <Plus className="h-4 w-4" /> New sale
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (ready && cart.lines.length === 0) {
    return (
      <div className="w-full">
        <Header title="Checkout" subtitle="Process your sale" />
        <div className="p-6">
          <Card className="mx-auto max-w-lg p-8 text-center">
            <p className="mb-4 text-[#403d39]">There are no items in the current bill.</p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" /> Back to register
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header title="Checkout" subtitle="Confirm items, take payment and print the receipt" />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#252422]">Order summary</h2>
            <ul className="divide-y divide-[#ccc5b9]/30">
              {cart.lines.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#252422]">{product.name}</p>
                    <p className="text-sm text-[#403d39]/70">
                      {quantity} × {money(product.price)} · SKU {product.sku}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold text-[#eb5e28]">{money(product.price * quantity)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#252422]">Customer (optional)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#252422]">Name</span>
                <input className={inputCls} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in Customer" autoComplete="off" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#252422]">Phone</span>
                <input className={inputCls} type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="For receipts & loyalty" autoComplete="off" />
              </label>
            </div>
            <p className="mt-2 text-xs text-[#403d39]/70">Customers with a name or phone are saved to your Customers list with their purchase history.</p>
          </Card>
        </div>

        <Card className="h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-[#252422]">Payment</h2>
          <div className="mb-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment method">
            {METHODS.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={method === value}
                onClick={() => setMethod(value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  method === value ? 'border-[#eb5e28] bg-[#eb5e28]/10 text-[#eb5e28]' : 'border-[#ccc5b9] text-[#403d39] hover:border-[#eb5e28]/60'
                }`}
              >
                <Icon className="h-4 w-4" /> {value}
              </button>
            ))}
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-[#252422]">Discount ({settings.currency})</span>
            <input className={inputCls} type="number" min={0} step="0.01" inputMode="decimal" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="0.00" />
          </label>

          {method === 'Cash' && (
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-[#252422]">Cash received</span>
              <input
                className={`${inputCls} ${cashShort ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={tenderedInput}
                onChange={e => setTenderedInput(e.target.value)}
                placeholder={totals.total.toFixed(2)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[totals.total, Math.ceil(totals.total / 10) * 10, Math.ceil(totals.total / 50) * 50, Math.ceil(totals.total / 100) * 100]
                  .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                  .map(v => (
                    <button key={v} type="button" onClick={() => setTenderedInput(v.toFixed(2))} className="rounded-full bg-[#ccc5b9]/30 px-3 py-1 text-xs font-medium text-[#403d39] hover:bg-[#ccc5b9]/50">
                      {money(v)}
                    </button>
                  ))}
              </div>
            </label>
          )}

          <dl className="space-y-2 border-t border-[#ccc5b9]/40 pt-3 text-sm text-[#403d39]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Tax {settings.taxRate ? `(${settings.taxRate}%)` : ''}</dt><dd>{money(totals.tax)}</dd></div>
            <div className="flex items-center justify-between border-t border-[#eb5e28]/30 pt-3">
              <dt className="font-semibold text-[#252422]">Total due</dt>
              <dd className="text-2xl font-bold text-[#eb5e28]">{money(totals.total)}</dd>
            </div>
            {method === 'Cash' && totals.change !== null && tenderedInput !== '' && (
              <div className={`flex justify-between font-semibold ${cashShort ? 'text-red-600' : 'text-green-700'}`}>
                <dt>{cashShort ? 'Amount short' : 'Change due'}</dt>
                <dd>{money(Math.abs(totals.change))}</dd>
              </div>
            )}
          </dl>

          <Button size="lg" className="mt-5 w-full" onClick={handleComplete} isLoading={submitting} disabled={cashShort || cart.lines.length === 0}>
            Complete sale · {money(totals.total)}
          </Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to register
          </Button>
        </Card>
      </div>
    </div>
  );
}
