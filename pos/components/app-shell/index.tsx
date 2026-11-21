'use client';

import { DataManagerProvider } from '@/lib/storage';
import { ToastProvider } from '@/app/providers/toast-provider';
import { CartProvider } from '@/app/(app)/cart-context';
import Sidebar, { MobileNav } from '@/components/sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataManagerProvider>
      <ToastProvider>
        <CartProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 md:ml-[72px] pb-20 md:pb-0">{children}</main>
          </div>
          <MobileNav />
        </CartProvider>
      </ToastProvider>
    </DataManagerProvider>
  );
}
