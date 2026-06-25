'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import { useDataManager } from '@/lib/storage';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'Credit Card' | 'Cash' | 'Digital Wallet' | 'Bank Transfer' | 'Check';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  date: string;
  timestamp: number; // generated internally
  customerName?: string;
  phoneNumber?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface PaymentContextType {
  payments: Payment[];
  addPayment: (
    payment: Omit<Payment, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>
  ) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByStatus: (status: Payment['status']) => Payment[];
  getTotalRevenue: () => number;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const {
    payments,
    addPayment: addPaymentDb,
    updatePayment: updatePaymentDb,
    deletePayment: deletePaymentDb,
  } = useDataManager();

  const addPayment = useCallback(
    (
      payment: Omit<Payment, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>
    ) => {
      return addPaymentDb({
        ...payment,
        timestamp: Date.now(),
      } as Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>);
    },
    [addPaymentDb]
  );

  const updatePayment = useCallback(
    (id: string, updates: Partial<Payment>) => {
      const { createdAt, updatedAt, timestamp, ...cleanUpdates } = updates;

      updatePaymentDb(id, cleanUpdates as Partial<Payment>);
    },
    [updatePaymentDb]
  );

  const deletePayment = useCallback(
    (id: string) => {
      deletePaymentDb(id);
    },
    [deletePaymentDb]
  );

  const getPaymentsByStatus = useCallback(
    (status: Payment['status']) => {
      return payments.filter(p => p.status === status);
    },
    [payments]
  );

  const getTotalRevenue = useCallback(() => {
    return payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const value = useMemo(
    () => ({
      payments,
      addPayment,
      updatePayment,
      deletePayment,
      getPaymentsByStatus,
      getTotalRevenue,
    }),
    [payments, addPayment, updatePayment, deletePayment, getPaymentsByStatus, getTotalRevenue]
  );

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
}