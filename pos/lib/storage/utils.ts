/**
 * Storage Utilities
 * Helper functions for storage operations
 */

import Database from './database';
import { DataStats } from './types';

/**
 * Reusable inferred types (FIX for SWC parser issues)
 */
type ProductItem = ReturnType<typeof Database.getProducts>[number];
type SaleItem = ReturnType<typeof Database.getSales>[number];
type CustomerItem = ReturnType<typeof Database.getCustomers>[number];

export class StorageUtils {
  /**
   * Get comprehensive statistics
   */
  static getStats(): DataStats {
    const payments = Database.getPayments();
    const sales = Database.getSales();
    const products = Database.getProducts();
    const customers = Database.getCustomers();

    const totalRevenue = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const completedPayments = payments.filter(
      p => p.status === 'Completed'
    ).length;

    const pendingPayments = payments.filter(
      p => p.status === 'Pending'
    ).length;

    return {
      totalRevenue,
      totalSales: sales.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      completedPayments,
      pendingPayments,
    };
  }

  /**
   * Check storage quota
   */
  static checkStorageQuota(): {
    used: number;
    limit: number;
    percentage: number;
  } {
    if (typeof window === 'undefined') {
      return { used: 0, limit: 5242880, percentage: 0 };
    }

    let used = 0;

    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length + key.length;
        }
      }
    }

    const limit = 5242880;
    const percentage = (used / limit) * 100;

    return { used, limit, percentage };
  }

  /**
   * Backup timestamp
   */
  static getBackupTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      ' ' +
      sizes[i]
    );
  }

  /**
   * Low stock items
   */
  static getLowStockItems(): Array<{
    id: number;
    name: string;
    quantity: number;
    reorder: number;
  }> {
    return Database.getProducts()
      .filter(p => p.quantity <= p.reorder)
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        reorder: p.reorder,
      }));
  }

  /**
   * Revenue by date range
   */
  static getRevenueByDateRange(
    startDate: Date,
    endDate: Date
  ): number {
    const payments = Database.getPayments();

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return payments
      .filter(
        p =>
          p.timestamp >= startTime &&
          p.timestamp <= endTime &&
          p.status === 'Completed'
      )
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /**
   * Global search
   */
  static globalSearch(query: string): {
    products: ProductItem[];
    sales: SaleItem[];
    customers: CustomerItem[];
  } {
    const q = query.toLowerCase();

    const products = Database.getProducts().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );

    const sales = Database.getSales().filter(
      s =>
        s.orderId.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q)
    );

    const customers = Database.getCustomers().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );

    return { products, sales, customers };
  }
}

export default StorageUtils;