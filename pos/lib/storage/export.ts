/**
 * Data Export Module
 * Handles exporting all system data to a JSON file for backup
 */

import Database from './database';
import { ExportedData } from './types';

export class DataExporter {
  /**
   * Generate complete export data
   */
  static generateExport(): ExportedData {
    const data = Database.getAllData();
    const products = data.products;
    const sales = data.sales;
    const payments = data.payments;
    const customers = data.customers;

    // Calculate metadata
    const totalRevenue = payments.reduce((sum, p) => {
      if (p.status === 'Completed') return sum + p.amount;
      return sum;
    }, 0);

    const exportedData: ExportedData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      exportedBy: data.settings.businessName,
      ...data,
      metadata: {
        totalProducts: products.length,
        totalSales: sales.length,
        totalPayments: payments.length,
        totalCustomers: customers.length,
        totalRevenue,
      },
    };

    return exportedData;
  }

  /**
   * Export data as JSON file
   */
  static downloadAsJSON(): void {
    const exportData = this.generateExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export data as CSV (for specific modules)
   */
  static downloadAsCSV(type: 'products' | 'sales' | 'payments' | 'customers'): void {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'products': {
        const products = Database.getProducts();
        csvContent = 'ID,Name,SKU,Category,Quantity,Reorder Level,Price,Status,Created At\n';
        products.forEach(p => {
          csvContent += `${p.id},"${p.name}",${p.sku},${p.categoryId},${p.quantity},${p.reorder},${p.price},"${p.status}",${new Date(p.createdAt).toISOString()}\n`;
        });
        filename = `products-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'sales': {
        const sales = Database.getSales();
        csvContent = 'ID,Order ID,Customer,Items Count,Total,Date,Status,Phone\n';
        sales.forEach(s => {
          csvContent += `${s.id},"${s.orderId}","${s.customer}",${s.items},${s.total},"${s.date}","${s.status}","${s.phoneNumber || 'N/A'}"\n`;
        });
        filename = `sales-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'payments': {
        const payments = Database.getPayments();
        csvContent = 'ID,Order ID,Amount,Method,Status,Date,Customer Name,Phone\n';
        payments.forEach(p => {
          csvContent += `"${p.id}","${p.orderId}",${p.amount},"${p.method}","${p.status}","${p.date}","${p.customerName || 'N/A'}","${p.phoneNumber || 'N/A'}"\n`;
        });
        filename = `payments-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'customers': {
        const customers = Database.getCustomers();
        csvContent = 'ID,Name,Email,Phone,Address,Total Purchases,Total Spent\n';
        customers.forEach(c => {
          csvContent += `${c.id},"${c.name}","${c.email}","${c.phone}","${c.address || 'N/A'}",${c.totalPurchases},${c.totalSpent}\n`;
        });
        filename = `customers-backup-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all data as ZIP (requires additional library)
   * This is a placeholder for future implementation
   */
  static async downloadAsZip(): Promise<void> {
    const exportData = this.generateExport();
    console.log('ZIP export would include all data');
    console.log('Requires jszip library for implementation');
    // Implementation would require jszip library
    // For now, use downloadAsJSON
    this.downloadAsJSON();
  }

  /**
   * Get export preview
   */
  static getExportPreview(): {
    summary: string;
    items: { label: string; count: number }[];
  } {
    const exportData = this.generateExport();
    const items = [
      { label: 'Products', count: exportData.metadata.totalProducts },
      { label: 'Sales', count: exportData.metadata.totalSales },
      { label: 'Payments', count: exportData.metadata.totalPayments },
      { label: 'Customers', count: exportData.metadata.totalCustomers },
    ];

    return {
      summary: `Total Revenue: $${exportData.metadata.totalRevenue.toFixed(2)} | ${exportData.metadata.totalSales} Sales`,
      items,
    };
  }
}

export default DataExporter;
