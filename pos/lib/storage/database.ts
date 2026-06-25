/**
 * LocalStorage Database Abstraction Layer
 * Provides a unified interface for accessing and persisting data
 */

import {
  Product,
  Sale,
  Payment,
  Customer,
  SystemSettings,
  StorageKeyMap,
  ExportedData,
} from './types';

const STORAGE_KEYS: StorageKeyMap = {
  products: 'pos_products',
  sales: 'pos_sales',
  payments: 'pos_payments',
  customers: 'pos_customers',
  settings: 'pos_settings',
};

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  businessName: 'My POS Store',
  businessEmail: 'admin@posstore.com',
  businessPhone: '+1 (555) 000-0000',
  currency: 'USD',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  lowStockThreshold: 20,
  theme: 'light',
  language: 'en',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};



class Database {
  /**
   * Initialize database with default data if it doesn't exist
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.products)) {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.sales)) {
      localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.payments)) {
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.customers)) {
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // ============ Products ============
  static getProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.products);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  }

  static saveProducts(products: Product[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }

  static addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: number, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveProducts(products);
    return products[index];
  }



  static deleteProduct(id: number): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    return true;
  }

  // ============ Sales ============
  static getSales(): Sale[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.sales);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sales:', error);
      return [];
    }
  }

  static saveSales(sales: Sale[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  }

  static addSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Sale {
    const sales = this.getSales();
    const newSale: Sale = {
      ...sale,
      id: Math.max(...sales.map(s => s.id), 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    sales.push(newSale);
    this.saveSales(sales);
    return newSale;
  }

  static updateSale(id: number, updates: Partial<Sale>): Sale | null {
    const sales = this.getSales();
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return null;

    sales[index] = {
      ...sales[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveSales(sales);
    return sales[index];
  }

  static deleteSale(id: number): boolean {
    const sales = this.getSales();
    const filtered = sales.filter(s => s.id !== id);
    if (filtered.length === sales.length) return false;
    this.saveSales(filtered);
    return true;
  }

  // ============ Payments ============
  static getPayments(): Payment[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.payments);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading payments:', error);
      return [];
    }
  }

  static savePayments(payments: Payment[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  }

  static addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  }

  static updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.savePayments(payments);
    return payments[index];
  }

  static deletePayment(id: string): boolean {
    const payments = this.getPayments();
    const filtered = payments.filter(p => p.id !== id);
    if (filtered.length === payments.length) return false;
    this.savePayments(filtered);
    return true;
  }

  // ============ Customers ============
  static getCustomers(): Customer[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.customers);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading customers:', error);
      return [];
    }
  }

  static saveCustomers(customers: Customer[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  }

  static addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    customers.push(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  }

  static updateCustomer(id: number, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveCustomers(customers);
    return customers[index];
  }

  static deleteCustomer(id: number): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    this.saveCustomers(filtered);
    return true;
  }

  // ============ Settings ============
  static getSettings(): SystemSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.settings);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error reading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated: SystemSettings = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
    return updated;
  }

  // ============ Bulk Operations ============
  static getAllData(): Omit<ExportedData, 'version' | 'exportedAt' | 'exportedBy' | 'metadata'> {
    return {
      products: this.getProducts(),
      sales: this.getSales(),
      payments: this.getPayments(),
      customers: this.getCustomers(),
      settings: this.getSettings(),
    };
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.products);
      localStorage.removeItem(STORAGE_KEYS.sales);
      localStorage.removeItem(STORAGE_KEYS.payments);
      localStorage.removeItem(STORAGE_KEYS.customers);
      localStorage.removeItem(STORAGE_KEYS.settings);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static restoreData(data: Omit<ExportedData, 'version' | 'exportedAt' | 'exportedBy' | 'metadata'>): void {
    if (typeof window === 'undefined') return;
    try {
      this.saveProducts(data.products);
      this.saveSales(data.sales);
      this.savePayments(data.payments);
      this.saveCustomers(data.customers);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
      }
    } catch (error) {
      console.error('Error restoring data:', error);
    }
  }
}

export default Database;
