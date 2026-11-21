/**
 * Core Data Types for POS System
 * Defines all interfaces and types used throughout the application
 */

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  quantity: number;
  reorder: number;
  price: number;
  status: StockStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: number;
  name: string;
  createdAt: number;
}

export interface SaleItem {
  productId?: number;
  sku?: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type PaymentMethod = 'Credit Card' | 'Cash' | 'Digital Wallet' | 'Bank Transfer' | 'Check';

export interface Sale {
  id: number;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  date: string;
  timestamp: number;
  status: 'Completed' | 'Processing' | 'Cancelled';
  phoneNumber?: string;
  saleItems: SaleItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  amountTendered?: number;
  change?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  date: string;
  timestamp: number;
  customerName?: string;
  phoneNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalPurchases: number;
  totalSpent: number;
  createdAt: number;
  updatedAt: number;
}

export interface SystemSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  currency: string;
  /** Sales tax percentage applied at checkout, e.g. 8.5 */
  taxRate: number;
  receiptFooter: string;
  defaultPaymentMethod: PaymentMethod;
  lowStockThreshold: number;
  lowStockAlerts: boolean;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExportedData {
  version: string;
  exportedAt: number;
  exportedBy: string;
  products: Product[];
  categories?: Category[];
  sales: Sale[];
  payments: Payment[];
  customers: Customer[];
  settings: SystemSettings;
  metadata: {
    totalProducts: number;
    totalSales: number;
    totalPayments: number;
    totalCustomers: number;
    totalRevenue: number;
  };
}

export interface StorageKeyMap {
  products: string;
  categories: string;
  sales: string;
  payments: string;
  customers: string;
  settings: string;
}

export interface DataStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  completedPayments: number;
  pendingPayments: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CompleteSaleInput {
  lines: CartLine[];
  customerName?: string;
  phoneNumber?: string;
  method: PaymentMethod;
  /** Flat discount amount in currency units */
  discount?: number;
  amountTendered?: number;
}

export type CompleteSaleResult =
  | { ok: true; sale: Sale }
  | { ok: false; error: string };
