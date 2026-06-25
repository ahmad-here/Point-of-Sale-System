'use client';

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react';

import Database from './database';
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
    Category
} from './types';

export interface DataManagerContextType {
    products: Product[];
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
    updateProduct: (id: number, updates: Partial<Product>) => Product | null;
    deleteProduct: (id: number) => boolean;

    categories: Category[];
    addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Category;
    updateCategory: (id: number, updates: Partial<Category>) => Category | null;
    deleteCategory: (id: number) => boolean;

    sales: Sale[];
    addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Sale;
    updateSale: (id: number, updates: Partial<Sale>) => Sale | null;
    deleteSale: (id: number) => boolean;

    payments: Payment[];
    addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
    updatePayment: (id: string, updates: Partial<Payment>) => Payment | null;
    deletePayment: (id: string) => boolean;

    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
    updateCustomer: (id: number, updates: Partial<Customer>) => Customer | null;
    deleteCustomer: (id: number) => boolean;

    settings: SystemSettings;

    stats: DataStats;
    refreshStats: () => void;

    exportData: (
        format: 'json' | 'csv',
        type?: 'products' | 'sales' | 'payments' | 'customers'
    ) => void;

    importData: (file: File) => Promise<ImportResult>;
    mergeData: (file: File) => Promise<ImportResult>;
    clearAllData: () => void;

    lowStockItems: Product[];
    storageQuota: { used: number; limit: number; percentage: number };

    refreshData: () => void;
}

const DataManagerContext = createContext<DataManagerContextType | undefined>(
    undefined
);

export function DataManagerProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [settings, setSettings] = useState<SystemSettings>(Database.getSettings());
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<DataStats>({
        totalRevenue: 0,
        totalSales: 0,
        totalProducts: 0,
        totalCustomers: 0,
        completedPayments: 0,
        pendingPayments: 0,
    });

    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [storageQuota, setStorageQuota] = useState({
        used: 0,
        limit: 5242880,
        percentage: 0,
    });

    const refreshStats = useCallback(() => {
        setStats(StorageUtils.getStats());
        setLowStockItems(StorageUtils.getLowStockItems() as Product[]);
    }, []);

    const refreshData = useCallback(() => {
        setProducts(Database.getProducts());
        setSales(Database.getSales());
        setPayments(Database.getPayments());
        setCustomers(Database.getCustomers());
        setSettings(Database.getSettings());

        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        }

        refreshStats();
        setStorageQuota(StorageUtils.checkStorageQuota());
    }, [refreshStats]);

    useEffect(() => {
        const stored = localStorage.getItem('categories');
        if (stored) {
            setCategories(JSON.parse(stored));
        }
        Database.initialize();
        refreshData();
    }, [refreshData]);

    const addCategory = useCallback(
        (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category => {
            const newCategory: Category = {
                id: Date.now(),
                name: category.name,
                createdAt: Date.now(),
            };

            setCategories(prev => {
                const updated = [...prev, newCategory];
                localStorage.setItem('categories', JSON.stringify(updated));
                return updated;
            });

            return newCategory;
        },
        []
    );

    const updateCategory = useCallback(
        (id: number, updates: Partial<Category>) => {
            const updated = categories.map((cat) =>
                cat.id === id
                    ? {
                        ...cat,
                        ...updates,
                        updatedAt: Date.now(),
                    }
                    : cat
            );

            setCategories(updated);
            localStorage.setItem('categories', JSON.stringify(updated));

            return updated.find((c) => c.id === id) || null;
        },
        [categories]
    );

    const deleteCategory = useCallback(
        (id: number) => {
            const updated = categories.filter((cat) => cat.id !== id);
            setCategories(updated);
            localStorage.setItem('categories', JSON.stringify(updated));
            return true;
        },
        [categories]
    );

    const addProduct = useCallback(
        (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
            const result = Database.addProduct(product);
            setProducts(Database.getProducts());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const updateProduct = useCallback(
        (id: number, updates: Partial<Product>) => {
            const result = Database.updateProduct(id, updates);
            setProducts(Database.getProducts());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const deleteProduct = useCallback(
        (id: number) => {
            const result = Database.deleteProduct(id);
            setProducts(Database.getProducts());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const addSale = useCallback(
        (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
            const result = Database.addSale(sale);
            setSales(Database.getSales());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const updateSale = useCallback(
        (id: number, updates: Partial<Sale>) => {
            const result = Database.updateSale(id, updates);
            setSales(Database.getSales());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const deleteSale = useCallback(
        (id: number) => {
            const result = Database.deleteSale(id);
            setSales(Database.getSales());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const addPayment = useCallback(
        (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
            const result = Database.addPayment(payment);
            setPayments(Database.getPayments());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const updatePayment = useCallback(
        (id: string, updates: Partial<Payment>) => {
            const result = Database.updatePayment(id, updates);
            setPayments(Database.getPayments());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const deletePayment = useCallback(
        (id: string) => {
            const result = Database.deletePayment(id);
            setPayments(Database.getPayments());
            refreshStats();
            return result;
        },
        [refreshStats]
    );

    const addCustomer = useCallback(
        (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
            const result = Database.addCustomer(customer);
            setCustomers(Database.getCustomers());
            return result;
        },
        []
    );

    const updateCustomer = useCallback(
        (id: number, updates: Partial<Customer>) => {
            const result = Database.updateCustomer(id, updates);
            setCustomers(Database.getCustomers());
            return result;
        },
        []
    );

    const deleteCustomer = useCallback(
        (id: number) => {
            const result = Database.deleteCustomer(id);
            setCustomers(Database.getCustomers());
            return result;
        },
        []
    );

    const exportData = useCallback(
        (
            format: 'json' | 'csv',
            type?: 'products' | 'sales' | 'payments' | 'customers'
        ) => {
            if (format === 'json') {
                DataExporter.downloadAsJSON();
            } else if (format === 'csv' && type) {
                DataExporter.downloadAsCSV(type);
            }
        },
        []
    );

    const importData = useCallback(async (file: File) => {
        const result = await DataImporter.importFromFile(file);
        if (result.success) refreshData();
        return result;
    }, [refreshData]);

    const mergeData = useCallback(async (file: File) => {
        const result = await DataImporter.mergeFromFile(file);
        if (result.success) refreshData();
        return result;
    }, [refreshData]);

    const clearAllData = useCallback(() => {
        Database.clearAllData();

        localStorage.removeItem('categories');
        setCategories([]);

        Database.initialize();
        refreshData();
    }, [refreshData]);

    return (
        React.createElement(
            DataManagerContext.Provider,
            {
                value: {
                    categories,
                    addCategory,
                    updateCategory,
                    deleteCategory,
                    products,
                    addProduct,
                    updateProduct,
                    deleteProduct,
                    sales,
                    addSale,
                    updateSale,
                    deleteSale,
                    payments,
                    addPayment,
                    updatePayment,
                    deletePayment,
                    customers,
                    addCustomer,
                    updateCustomer,
                    deleteCustomer,
                    settings,
                    stats,
                    refreshStats,
                    exportData,
                    importData,
                    mergeData,
                    clearAllData,
                    lowStockItems,
                    storageQuota,
                    refreshData,
                },
            },
            children,
        )
    );
}
export function useDataManager() {
    const context = useContext(DataManagerContext);
    if (!context) {
        throw new Error('useDataManager must be used within DataManagerProvider');
    }
    return context;
}

export default DataManagerContext;