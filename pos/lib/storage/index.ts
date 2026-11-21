'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

import Database, { DEFAULT_SETTINGS } from './database';
import DataExporter from './export';
import DataImporter, { ImportResult } from './import';
import StorageUtils from './utils';

import {
  Product,
  Sale,
  Payment,
  Customer,
  SystemSettings,
  DataStats,
  Category,
  CompleteSaleInput,
  CompleteSaleResult,
} from './types';

type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export interface DataManagerContextType {
  /** False until localStorage has been read on the client. Use to avoid empty-state flashes. */
  ready: boolean;

  products: Product[];
  addProduct: (product: NewProduct) => Product;
  updateProduct: (id: number, updates: Partial<Product>) => Product | null;
  deleteProduct: (id: number) => boolean;
  skuExists: (sku: string, exceptId?: number) => boolean;

  categories: Category[];
  addCategory: (category: { name: string }) => Category;
  updateCategory: (id: number, updates: Partial<Category>) => Category | null;
  deleteCategory: (id: number) => boolean;

  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Sale;
  updateSale: (id: number, updates: Partial<Sale>) => Sale | null;
  deleteSale: (id: number) => boolean;
  completeSale: (input: CompleteSaleInput) => CompleteSaleResult;
  refundSale: (id: number) => { ok: boolean; error?: string };

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> & { timestamp?: number }) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => Payment | null;
  deletePayment: (id: string) => boolean;
  nextOrderId: () => string;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: number, updates: Partial<Customer>) => Customer | null;
  deleteCustomer: (id: number) => boolean;

  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => SystemSettings;

  stats: DataStats;
  refreshStats: () => void;

  exportData: (format: 'json' | 'csv', type?: 'products' | 'sales' | 'payments' | 'customers') => void;
  importData: (file: File) => Promise<ImportResult>;
  mergeData: (file: File) => Promise<ImportResult>;
  clearAllData: () => void;

  lowStockItems: Product[];
  storageQuota: { used: number; limit: number; percentage: number };

  refreshData: () => void;
}

const DataManagerContext = createContext<DataManagerContextType | undefined>(undefined);

export function DataManagerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Start from defaults so server and first client render match (no hydration mismatch)
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [storageQuota, setStorageQuota] = useState({ used: 0, limit: 5242880, percentage: 0 });

  const refreshData = useCallback(() => {
    setProducts(Database.getProducts());
    setCategories(Database.getCategories());
    setSales(Database.getSales());
    setPayments(Database.getPayments());
    setCustomers(Database.getCustomers());
    setSettings(Database.getSettings());
    setStorageQuota(StorageUtils.checkStorageQuota());
  }, []);

  useEffect(() => {
    // Hydrate from localStorage after mount. Reading it during render would
    // make the server HTML and first client render disagree.
    Database.initialize();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshData();
    setReady(true);

    // Keep multiple open tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith('pos_') || e.key === 'categories') refreshData();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshData]);

  const stats = useMemo<DataStats>(() => {
    const completed = payments.filter(p => p.status === 'Completed');
    return {
      totalRevenue: completed.reduce((s, p) => s + p.amount, 0),
      totalSales: sales.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      completedPayments: completed.length,
      pendingPayments: payments.filter(p => p.status === 'Pending').length,
    };
  }, [payments, sales, products, customers]);

  const lowStockItems = useMemo(() => products.filter(p => p.status !== 'In Stock'), [products]);

  // ---------- helpers that run a DB write then resync state ----------
  const withProducts = useCallback(<T,>(fn: () => T): T => {
    const r = fn();
    setProducts(Database.getProducts());
    return r;
  }, []);

  const addProduct = useCallback((p: NewProduct) => withProducts(() => Database.addProduct(p)), [withProducts]);
  const updateProduct = useCallback(
    (id: number, u: Partial<Product>) => withProducts(() => Database.updateProduct(id, u)),
    [withProducts]
  );
  const deleteProduct = useCallback((id: number) => withProducts(() => Database.deleteProduct(id)), [withProducts]);
  const skuExists = useCallback((sku: string, exceptId?: number) => Database.skuExists(sku, exceptId), []);

  const addCategory = useCallback((c: { name: string }) => {
    const r = Database.addCategory(c.name);
    setCategories(Database.getCategories());
    return r;
  }, []);
  const updateCategory = useCallback((id: number, u: Partial<Category>) => {
    const r = Database.updateCategory(id, u);
    setCategories(Database.getCategories());
    return r;
  }, []);
  const deleteCategory = useCallback((id: number) => {
    const r = Database.deleteCategory(id);
    setCategories(Database.getCategories());
    return r;
  }, []);

  const addSale = useCallback((s: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    const r = Database.addSale(s);
    setSales(Database.getSales());
    return r;
  }, []);
  const updateSale = useCallback((id: number, u: Partial<Sale>) => {
    const r = Database.updateSale(id, u);
    setSales(Database.getSales());
    return r;
  }, []);
  const deleteSale = useCallback((id: number) => {
    const r = Database.deleteSale(id);
    setSales(Database.getSales());
    return r;
  }, []);

  const completeSale = useCallback(
    (input: CompleteSaleInput) => {
      try {
        const r = Database.completeSale(input, Database.getSettings().taxRate);
        refreshData();
        return r;
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : 'Could not complete sale.' };
      }
    },
    [refreshData]
  );

  const refundSale = useCallback(
    (id: number) => {
      const r = Database.refundSale(id);
      refreshData();
      return r;
    },
    [refreshData]
  );

  const addPayment = useCallback(
    (p: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> & { timestamp?: number }) => {
      const r = Database.addPayment({ ...p, timestamp: p.timestamp ?? Date.now() });
      setPayments(Database.getPayments());
      return r;
    },
    []
  );
  const updatePayment = useCallback((id: string, u: Partial<Payment>) => {
    const r = Database.updatePayment(id, u);
    setPayments(Database.getPayments());
    return r;
  }, []);
  const deletePayment = useCallback((id: string) => {
    const r = Database.deletePayment(id);
    setPayments(Database.getPayments());
    return r;
  }, []);
  const nextOrderId = useCallback(() => Database.nextOrderId(), []);

  const addCustomer = useCallback((c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const r = Database.addCustomer(c);
    setCustomers(Database.getCustomers());
    return r;
  }, []);
  const updateCustomer = useCallback((id: number, u: Partial<Customer>) => {
    const r = Database.updateCustomer(id, u);
    setCustomers(Database.getCustomers());
    return r;
  }, []);
  const deleteCustomer = useCallback((id: number) => {
    const r = Database.deleteCustomer(id);
    setCustomers(Database.getCustomers());
    return r;
  }, []);

  const updateSettings = useCallback((u: Partial<SystemSettings>) => {
    const r = Database.updateSettings(u);
    setSettings(r);
    return r;
  }, []);

  const refreshStats = useCallback(() => refreshData(), [refreshData]);

  const exportData = useCallback(
    (format: 'json' | 'csv', type?: 'products' | 'sales' | 'payments' | 'customers') => {
      if (format === 'json') DataExporter.downloadAsJSON();
      else if (type) DataExporter.downloadAsCSV(type);
    },
    []
  );

  const importData = useCallback(
    async (file: File) => {
      const result = await DataImporter.importFromFile(file);
      if (result.success) refreshData();
      return result;
    },
    [refreshData]
  );

  const mergeData = useCallback(
    async (file: File) => {
      const result = await DataImporter.mergeFromFile(file);
      if (result.success) refreshData();
      return result;
    },
    [refreshData]
  );

  const clearAllData = useCallback(() => {
    Database.clearAllData();
    Database.initialize();
    refreshData();
  }, [refreshData]);

  const value: DataManagerContextType = {
    ready,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    skuExists,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    sales,
    addSale,
    updateSale,
    deleteSale,
    completeSale,
    refundSale,
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    nextOrderId,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    settings,
    updateSettings,
    stats,
    refreshStats,
    exportData,
    importData,
    mergeData,
    clearAllData,
    lowStockItems,
    storageQuota,
    refreshData,
  };

  return React.createElement(DataManagerContext.Provider, { value }, children);
}

export function useDataManager() {
  const context = useContext(DataManagerContext);
  if (!context) throw new Error('useDataManager must be used within DataManagerProvider');
  return context;
}

/** Currency formatter bound to the store's configured currency. */
export function useMoney() {
  const { settings } = useDataManager();
  return useMemo(() => {
    let fmt: Intl.NumberFormat;
    try {
      fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.currency || 'USD' });
    } catch {
      fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
    }
    return (n: number) => fmt.format(Number.isFinite(n) ? n : 0);
  }, [settings.currency]);
}

export default DataManagerContext;
