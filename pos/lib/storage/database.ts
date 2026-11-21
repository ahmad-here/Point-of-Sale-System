/**
 * LocalStorage Database Abstraction Layer
 * Provides a unified interface for accessing and persisting data
 */

import {
  Product,
  Category,
  Sale,
  Payment,
  Customer,
  SystemSettings,
  StorageKeyMap,
  ExportedData,
  StockStatus,
  CompleteSaleInput,
  CompleteSaleResult,
} from './types';

const STORAGE_KEYS: StorageKeyMap = {
  products: 'pos_products',
  categories: 'categories',
  sales: 'pos_sales',
  payments: 'pos_payments',
  customers: 'pos_customers',
  settings: 'pos_settings',
};

export const DEFAULT_SETTINGS: SystemSettings = {
  businessName: 'My Store',
  businessEmail: '',
  businessPhone: '',
  businessAddress: '',
  currency: 'USD',
  taxRate: 0,
  receiptFooter: 'Thank you for your purchase!',
  defaultPaymentMethod: 'Cash',
  lowStockThreshold: 10,
  lowStockAlerts: true,
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  language: 'en',
  createdAt: 0,
  updatedAt: 0,
};

const isBrowser = () => typeof window !== 'undefined';

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw new Error('Storage is full or unavailable. Export a backup and clear old data.');
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeStockStatus(quantity: number, reorder: number): StockStatus {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= reorder) return 'Low Stock';
  return 'In Stock';
}

const nextId = (items: { id: number }[]) =>
  items.reduce((max, i) => (i.id > max ? i.id : max), 0) + 1;

class Database {
  static initialize(): void {
    if (!isBrowser()) return;
    const empties = [STORAGE_KEYS.products, STORAGE_KEYS.sales, STORAGE_KEYS.payments, STORAGE_KEYS.customers, STORAGE_KEYS.categories];
    for (const key of empties) {
      if (!localStorage.getItem(key)) localStorage.setItem(key, '[]');
    }
    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
      write(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS, createdAt: Date.now(), updatedAt: Date.now() });
    }
  }

  // ============ Products ============
  static getProducts(): Product[] {
    // Normalise status on read so legacy data (which never had "Low Stock") is accurate
    return read<Product[]>(STORAGE_KEYS.products, []).map(p => ({
      ...p,
      price: Number(p.price) || 0,
      quantity: Number(p.quantity) || 0,
      reorder: Number(p.reorder) || 0,
      status: computeStockStatus(Number(p.quantity) || 0, Number(p.reorder) || 0),
    }));
  }

  static saveProducts(products: Product[]): void {
    write(STORAGE_KEYS.products, products);
  }

  static skuExists(sku: string, exceptId?: number): boolean {
    const s = sku.trim().toLowerCase();
    return this.getProducts().some(p => p.sku.trim().toLowerCase() === s && p.id !== exceptId);
  }

  static addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: StockStatus }): Product {
    const products = this.getProducts();
    const now = Date.now();
    const newProduct: Product = {
      ...product,
      id: nextId(products),
      status: computeStockStatus(product.quantity, product.reorder),
      createdAt: now,
      updatedAt: now,
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: number, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const merged = { ...products[index], ...updates, id, updatedAt: Date.now() };
    merged.status = computeStockStatus(merged.quantity, merged.reorder);
    products[index] = merged;
    this.saveProducts(products);
    return merged;
  }

  static deleteProduct(id: number): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    return true;
  }

  // ============ Categories ============
  static getCategories(): Category[] {
    return read<Category[]>(STORAGE_KEYS.categories, []);
  }

  static saveCategories(categories: Category[]): void {
    write(STORAGE_KEYS.categories, categories);
  }

  static addCategory(name: string): Category {
    const categories = this.getCategories();
    const existing = categories.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;
    const category: Category = { id: nextId(categories), name: name.trim(), createdAt: Date.now() };
    categories.push(category);
    this.saveCategories(categories);
    return category;
  }

  static updateCategory(id: number, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates, id };
    this.saveCategories(categories);
    return categories[index];
  }

  static deleteCategory(id: number): boolean {
    if (this.getProducts().some(p => p.categoryId === id)) return false;
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    this.saveCategories(filtered);
    return true;
  }

  // ============ Sales ============
  static getSales(): Sale[] {
    return read<Sale[]>(STORAGE_KEYS.sales, []);
  }

  static saveSales(sales: Sale[]): void {
    write(STORAGE_KEYS.sales, sales);
  }

  /** Sequential, human-friendly order numbers: #1001, #1002, ... */
  static nextOrderId(): string {
    const used = [...this.getSales().map(s => s.orderId), ...this.getPayments().map(p => p.orderId)];
    const max = used.reduce((m, id) => {
      const n = parseInt(String(id).replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 1000);
    return `#${max + 1}`;
  }

  static addSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Sale {
    const sales = this.getSales();
    const now = Date.now();
    const newSale: Sale = { ...sale, id: nextId(sales), createdAt: now, updatedAt: now };
    sales.push(newSale);
    this.saveSales(sales);
    return newSale;
  }

  static updateSale(id: number, updates: Partial<Sale>): Sale | null {
    const sales = this.getSales();
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) return null;
    sales[index] = { ...sales[index], ...updates, id, updatedAt: Date.now() };
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

  /**
   * Completes a sale as one unit of work: validates stock against the
   * latest stored quantities, decrements inventory, records the sale and
   * payment, and updates the customer record.
   */
  static completeSale(input: CompleteSaleInput, taxRate: number): CompleteSaleResult {
    const lines = input.lines.filter(l => l.quantity > 0);
    if (lines.length === 0) return { ok: false, error: 'The cart is empty.' };

    const products = this.getProducts();
    for (const line of lines) {
      const current = products.find(p => p.id === line.product.id);
      if (!current) return { ok: false, error: `${line.product.name} no longer exists in inventory.` };
      if (current.quantity < line.quantity) {
        return { ok: false, error: `Only ${current.quantity} × ${current.name} left in stock.` };
      }
    }

    const saleItems = lines.map(l => {
      const current = products.find(p => p.id === l.product.id)!;
      return {
        productId: current.id,
        sku: current.sku,
        name: current.name,
        quantity: l.quantity,
        price: current.price,
        subtotal: round2(current.price * l.quantity),
      };
    });

    const subtotal = round2(saleItems.reduce((s, i) => s + i.subtotal, 0));
    const discount = round2(Math.min(Math.max(input.discount || 0, 0), subtotal));
    const tax = round2(((subtotal - discount) * Math.max(taxRate, 0)) / 100);
    const total = round2(subtotal - discount + tax);

    let amountTendered: number | undefined;
    let change: number | undefined;
    if (input.method === 'Cash' && input.amountTendered !== undefined && !Number.isNaN(input.amountTendered)) {
      if (input.amountTendered < total) {
        return { ok: false, error: 'Cash received is less than the total due.' };
      }
      amountTendered = round2(input.amountTendered);
      change = round2(amountTendered - total);
    }

    // Decrement stock
    const updatedProducts = products.map(p => {
      const line = lines.find(l => l.product.id === p.id);
      if (!line) return p;
      const quantity = p.quantity - line.quantity;
      return { ...p, quantity, status: computeStockStatus(quantity, p.reorder), updatedAt: Date.now() };
    });
    this.saveProducts(updatedProducts);

    const orderId = this.nextOrderId();
    const now = new Date();
    const customerName = input.customerName?.trim() || '';
    const phoneNumber = input.phoneNumber?.trim() || '';

    const sale = this.addSale({
      orderId,
      customer: customerName || 'Walk-in Customer',
      phoneNumber: phoneNumber || undefined,
      items: saleItems.reduce((s, i) => s + i.quantity, 0),
      saleItems,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: input.method,
      amountTendered,
      change,
      date: todayISO(now),
      timestamp: now.getTime(),
      status: 'Completed',
    });

    this.addPayment({
      orderId,
      amount: total,
      method: input.method,
      status: 'Completed',
      date: todayISO(now),
      timestamp: now.getTime(),
      customerName: customerName || undefined,
      phoneNumber: phoneNumber || undefined,
      notes: `${sale.items} item(s)`,
    });

    if (customerName || phoneNumber) this.recordCustomerPurchase(customerName, phoneNumber, total);

    return { ok: true, sale };
  }

  /** Cancels a completed sale, returns items to stock and marks its payment refunded. */
  static refundSale(id: number): { ok: boolean; error?: string } {
    const sale = this.getSales().find(s => s.id === id);
    if (!sale) return { ok: false, error: 'Sale not found.' };
    if (sale.status === 'Cancelled') return { ok: false, error: 'This sale was already refunded.' };

    const products = this.getProducts();
    const restored = products.map(p => {
      const item = sale.saleItems.find(i => (i.productId !== undefined ? i.productId === p.id : i.name === p.name));
      if (!item) return p;
      const quantity = p.quantity + item.quantity;
      return { ...p, quantity, status: computeStockStatus(quantity, p.reorder), updatedAt: Date.now() };
    });
    this.saveProducts(restored);

    this.updateSale(id, { status: 'Cancelled' });

    const payments = this.getPayments().map(p =>
      p.orderId === sale.orderId && p.status === 'Completed'
        ? { ...p, status: 'Refunded' as const, updatedAt: Date.now() }
        : p
    );
    this.savePayments(payments);

    if (sale.customer !== 'Walk-in Customer' || sale.phoneNumber) {
      const customers = this.getCustomers().map(c =>
        this.matchesCustomer(c, sale.customer, sale.phoneNumber || '')
          ? {
              ...c,
              totalPurchases: Math.max(c.totalPurchases - 1, 0),
              totalSpent: round2(Math.max(c.totalSpent - sale.total, 0)),
              updatedAt: Date.now(),
            }
          : c
      );
      this.saveCustomers(customers);
    }
    return { ok: true };
  }

  // ============ Payments ============
  static getPayments(): Payment[] {
    return read<Payment[]>(STORAGE_KEYS.payments, []);
  }

  static savePayments(payments: Payment[]): void {
    write(STORAGE_KEYS.payments, payments);
  }

  static addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const payments = this.getPayments();
    const now = Date.now();
    const newPayment: Payment = {
      ...payment,
      timestamp: payment.timestamp || now,
      id: `PAY-${now}-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: now,
      updatedAt: now,
    };
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  }

  static updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return null;
    payments[index] = { ...payments[index], ...updates, id, updatedAt: Date.now() };
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
    return read<Customer[]>(STORAGE_KEYS.customers, []);
  }

  static saveCustomers(customers: Customer[]): void {
    write(STORAGE_KEYS.customers, customers);
  }

  private static matchesCustomer(c: Customer, name: string, phone: string): boolean {
    if (phone && c.phone) return c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '');
    return !!name && c.name.trim().toLowerCase() === name.trim().toLowerCase();
  }

  static recordCustomerPurchase(name: string, phone: string, amount: number): Customer {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => this.matchesCustomer(c, name, phone));
    const now = Date.now();
    if (index >= 0) {
      const c = customers[index];
      customers[index] = {
        ...c,
        name: name || c.name,
        phone: phone || c.phone,
        totalPurchases: c.totalPurchases + 1,
        totalSpent: round2(c.totalSpent + amount),
        updatedAt: now,
      };
      this.saveCustomers(customers);
      return customers[index];
    }
    const customer: Customer = {
      id: nextId(customers),
      name: name || 'Unnamed customer',
      phone,
      email: '',
      totalPurchases: 1,
      totalSpent: round2(amount),
      createdAt: now,
      updatedAt: now,
    };
    customers.push(customer);
    this.saveCustomers(customers);
    return customer;
  }

  static addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.getCustomers();
    const now = Date.now();
    const newCustomer: Customer = { ...customer, id: nextId(customers), createdAt: now, updatedAt: now };
    customers.push(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  }

  static updateCustomer(id: number, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...updates, id, updatedAt: Date.now() };
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
    const stored = read<Partial<SystemSettings>>(STORAGE_KEYS.settings, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  static updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const updated: SystemSettings = { ...this.getSettings(), ...updates, updatedAt: Date.now() };
    write(STORAGE_KEYS.settings, updated);
    return updated;
  }

  // ============ Bulk Operations ============
  static getAllData(): Omit<ExportedData, 'version' | 'exportedAt' | 'exportedBy' | 'metadata'> {
    return {
      products: this.getProducts(),
      categories: this.getCategories(),
      sales: this.getSales(),
      payments: this.getPayments(),
      customers: this.getCustomers(),
      settings: this.getSettings(),
    };
  }

  static clearAllData(): void {
    if (!isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }

  static restoreData(data: Omit<ExportedData, 'version' | 'exportedAt' | 'exportedBy' | 'metadata'>): void {
    this.saveProducts(data.products);
    this.saveCategories(data.categories || []);
    this.saveSales(data.sales);
    this.savePayments(data.payments);
    this.saveCustomers(data.customers);
    write(STORAGE_KEYS.settings, { ...DEFAULT_SETTINGS, ...data.settings });
  }
}

export default Database;
