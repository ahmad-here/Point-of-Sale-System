'use client';

import { InventoryProvider } from './context';
import { ToastProvider, ToastContainer } from '@/app/providers/toast-provider';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <InventoryProvider>
        {children}
        <ToastContainer />
      </InventoryProvider>
    </ToastProvider>
  );
}
