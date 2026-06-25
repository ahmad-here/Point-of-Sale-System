'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useDataManager } from '@/lib/storage';

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
  createdAt?: number;
  updatedAt?: number;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Sale;
  deleteSale: (id: number) => void;
  getSalesByStatus: (status: Sale['status']) => Sale[];
  getTotalSales: () => number;
  updateSale: (id: number, updates: Partial<Sale>) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const { sales: dbSales, addSale: addSaleDb, deleteSale: deleteSaleDb, updateSale: updateSaleDb } = useDataManager();
  const [sales, setSales] = useState<Sale[]>([]);

  // Sync with DataManager
  useEffect(() => {
    setSales(dbSales);
  }, [dbSales]);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSale = addSaleDb(sale);
    return newSale;
  }, [addSaleDb]);

  const deleteSale = useCallback((id: number) => {
    deleteSaleDb(id);
  }, [deleteSaleDb]);

  const updateSale = useCallback((id: number, updates: Partial<Sale>) => {
    const { createdAt: __, updatedAt: ___, ...cleanUpdates } = updates;
    updateSaleDb(id, cleanUpdates as any);
  }, [updateSaleDb]);

  const getSalesByStatus = useCallback((status: Sale['status']) => {
    return sales.filter(sale => sale.status === status);
  }, [sales]);

  const getTotalSales = useCallback(() => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }, [sales]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        deleteSale,
        getSalesByStatus,
        getTotalSales,
        updateSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}
