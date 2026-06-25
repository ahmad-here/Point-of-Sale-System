'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/storage/types';
export interface SaleItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CheckoutData {
  items: SaleItem[];
  totalAmount: number;
  customerName?: string;
  phoneNumber?: string;
}

interface CheckoutContextType {
  checkoutData: CheckoutData | null;
  setSaleCheckoutData: (items: SaleItem[], totalAmount: number) => void;
  updateCustomerInfo: (name: string, phone: string) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  const setSaleCheckoutData = (items: SaleItem[], totalAmount: number) => {
    setCheckoutData({
      items,
      totalAmount,
    });
  };

  const updateCustomerInfo = (name: string, phone: string) => {
    if (checkoutData) {
      setCheckoutData({
        ...checkoutData,
        customerName: name || undefined,
        phoneNumber: phone || undefined,
      });
    }
  };

  const clearCheckout = () => {
    setCheckoutData(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutData,
        setSaleCheckoutData,
        updateCustomerInfo,
        clearCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
