"use client"
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useDataManager } from '@/lib/storage';
import { Product } from '@/lib/storage/types';


interface InventoryContextType {
  items: Product[];
  setItems: (items: Product[]) => void;
  addProduct: (product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { products, addProduct: addProductDb, updateProduct: updateProductDb, deleteProduct: deleteProductDb } = useDataManager();
  const [items, setItems] = useState<Product[]>(products);

  // Sync with DataManager
  useEffect(() => {
    const mappedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId, 
      quantity: p.quantity,
      reorder: p.reorder,
      price: p.price,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    setItems(mappedProducts);
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const status = product.quantity > 0 ? 'In Stock' : 'Out of Stock';
    addProductDb({
      ...product,
      status,
      price: product.price || 0,
    });
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    const { status: _, createdAt: __, updatedAt: ___, ...cleanUpdates } = updates;
    updateProductDb(id, {
      ...cleanUpdates,
      status: updates.quantity !== undefined 
        ? updates.quantity > 0 ? 'In Stock' : 'Out of Stock'
        : updates.status,
    } as any);
  };

  const deleteProduct = (id: number) => {
    deleteProductDb(id);
  };

  return (
    <InventoryContext.Provider value={{ items: products, setItems, addProduct, updateProduct, deleteProduct }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
