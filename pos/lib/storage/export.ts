/**
 * Data Export Module
 * Handles exporting all system data to JSON (full backup) or CSV (per module)
 */

import Database from './database';
import { ExportedData } from './types';

function download(content: string, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export class DataExporter {
  /**
   * Generate complete export data
   */
  static generateExport(): ExportedData {
    const data = Database.getAllData();
    const totalRevenue = data.payments.reduce((sum, p) => (p.status === 'Completed' ? sum + p.amount : sum), 0);

    return {
      version: '1.1.0',
      exportedAt: Date.now(),
      exportedBy: data.settings.businessName,
      ...data,
      metadata: {
        totalProducts: data.products.length,
        totalSales: data.sales.length,
        totalPayments: data.payments.length,
        totalCustomers: data.customers.length,
        totalRevenue,
      },
    };
  }

  /**
   * Export data as JSON file
   */
  static downloadAsJSON(): void {
    const json = JSON.stringify(this.generateExport(), null, 2);
    download(json, 'application/json', `pos-backup-${new Date().toISOString().split('T')[0]}.json`);
  }

  /**
   * Escape a value for CSV (RFC 4180) and neutralise spreadsheet formula injection
   */
  static csvCell(value: unknown): string {
    let s = value === undefined || value === null ? '' : String(value);
    if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  static toCSV(headers: string[], rows: unknown[][]): string {
    return [headers, ...rows].map(r => r.map(c => this.csvCell(c)).join(',')).join('\n') + '\n';
  }

  /**
   * Export data as CSV (for specific modules)
   */
  static downloadAsCSV(type: 'products' | 'sales' | 'payments' | 'customers'): void {
    const day = new Date().toISOString().split('T')[0];
    let csv = '';

    switch (type) {
      case 'products': {
        const categories = Database.getCategories();
        // Header names match the inventory CSV importer so the file can be re-imported
        csv = this.toCSV(
          ['name', 'sku', 'category', 'quantity', 'price', 'reorderlevel', 'status'],
          Database.getProducts().map(p => [
            p.name,
            p.sku,
            categories.find(c => c.id === p.categoryId)?.name || '',
            p.quantity,
            p.price,
            p.reorder,
            p.status,
          ])
        );
        break;
      }
      case 'sales':
        csv = this.toCSV(
          ['Order ID', 'Date', 'Customer', 'Phone', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method', 'Status'],
          Database.getSales().map(s => [
            s.orderId,
            s.date,
            s.customer,
            s.phoneNumber || '',
            s.items,
            s.subtotal ?? s.total,
            s.discount ?? 0,
            s.tax ?? 0,
            s.total,
            s.paymentMethod || '',
            s.status,
          ])
        );
        break;
      case 'payments':
        csv = this.toCSV(
          ['Payment ID', 'Order ID', 'Date', 'Amount', 'Method', 'Status', 'Customer', 'Phone', 'Notes'],
          Database.getPayments().map(p => [
            p.id,
            p.orderId,
            p.date,
            p.amount,
            p.method,
            p.status,
            p.customerName || '',
            p.phoneNumber || '',
            p.notes || '',
          ])
        );
        break;
      case 'customers':
        csv = this.toCSV(
          ['Name', 'Phone', 'Email', 'Address', 'Purchases', 'Total Spent'],
          Database.getCustomers().map(c => [c.name, c.phone, c.email, c.address || '', c.totalPurchases, c.totalSpent])
        );
        break;
    }

    download(csv, 'text/csv;charset=utf-8', `${type}-${day}.csv`);
  }
}

export default DataExporter;
