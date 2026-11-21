'use client';

import type { Sale } from '@/lib/storage/types';
import { useDataManager, useMoney } from '@/lib/storage';

/** Printable receipt. Only elements inside `.print-area` appear on paper. */
export default function Receipt({ sale }: { sale: Sale }) {
  const { settings } = useDataManager();
  const money = useMoney();
  const when = new Date(sale.timestamp || sale.createdAt);
  const subtotal = sale.subtotal ?? sale.saleItems.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="print-area mx-auto w-full max-w-md rounded-xl border border-[#ccc5b9]/50 bg-white p-6 font-mono text-sm text-[#252422]">
      <div className="mb-4 text-center">
        <p className="text-lg font-bold">{settings.businessName}</p>
        {settings.businessAddress && <p className="whitespace-pre-line text-xs">{settings.businessAddress}</p>}
        {(settings.businessPhone || settings.businessEmail) && (
          <p className="text-xs">{[settings.businessPhone, settings.businessEmail].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      <div className="mb-3 flex justify-between border-y border-dashed border-[#403d39]/40 py-2 text-xs">
        <span>Order {sale.orderId}</span>
        <span>
          {when.toLocaleDateString()} {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {sale.status === 'Cancelled' && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 py-1 text-center text-xs font-bold text-red-700">REFUNDED</p>
      )}

      <p className="mb-2 text-xs">Customer: {sale.customer}{sale.phoneNumber ? ` · ${sale.phoneNumber}` : ''}</p>

      <table className="mb-3 w-full text-xs">
        <thead>
          <tr className="border-b border-dashed border-[#403d39]/40">
            <th className="py-1 text-left font-semibold">Item</th>
            <th className="py-1 text-right font-semibold">Qty</th>
            <th className="py-1 text-right font-semibold">Price</th>
            <th className="py-1 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.saleItems.map((item, i) => (
            <tr key={i}>
              <td className="py-1 pr-2">{item.name}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{money(item.price)}</td>
              <td className="py-1 text-right">{money(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-dashed border-[#403d39]/40 pt-2 text-xs">
        <Row label="Subtotal" value={money(subtotal)} />
        {!!sale.discount && <Row label="Discount" value={`−${money(sale.discount)}`} />}
        {sale.tax !== undefined && <Row label={`Tax${settings.taxRate ? ` (${settings.taxRate}%)` : ''}`} value={money(sale.tax)} />}
        <div className="flex justify-between border-t border-[#403d39]/40 pt-1 text-base font-bold">
          <span>Total</span>
          <span>{money(sale.total)}</span>
        </div>
        {sale.paymentMethod && <Row label="Paid by" value={sale.paymentMethod} />}
        {sale.amountTendered !== undefined && <Row label="Cash received" value={money(sale.amountTendered)} />}
        {sale.change !== undefined && <Row label="Change" value={money(sale.change)} />}
      </div>

      {settings.receiptFooter && <p className="mt-4 text-center text-xs">{settings.receiptFooter}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
