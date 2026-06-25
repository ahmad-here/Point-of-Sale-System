/**
 * Core Data Types for POS System
 * Defines all interfaces and types used throughout the application
 */

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  quantity: number;
  reorder: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: number;
  name: string;
  createdAt: number;
}

export interface SaleItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

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
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'Credit Card' | 'Cash' | 'Digital Wallet' | 'Bank Transfer' | 'Check';
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
  currency: string;
  timezone: string;
  dateFormat: string;
  lowStockThreshold: number;
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
