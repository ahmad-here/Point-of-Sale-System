'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Store, AlertTriangle } from 'lucide-react';
import { useDataManager } from '@/lib/storage';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [ref, onOutside]);
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { lowStockItems, settings } = useDataManager();
  const [open, setOpen] = useState<'alerts' | 'profile' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(null));

  const alerts = settings.lowStockAlerts ? lowStockItems : [];

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[#ccc5b9]/30 bg-[#fffcf2]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-[#252422] sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 hidden text-sm text-[#403d39] sm:block">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2" ref={ref}>
          {actions}
          <div className="relative">
            <button
              type="button"
              aria-label={`Stock alerts (${alerts.length})`}
              aria-expanded={open === 'alerts'}
              onClick={() => setOpen(open === 'alerts' ? null : 'alerts')}
              className="relative rounded-lg p-2 text-[#403d39] transition-colors hover:bg-[#eb5e28]/10 hover:text-[#eb5e28]"
            >
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eb5e28] px-1 text-[10px] font-bold text-white">
                  {alerts.length > 99 ? '99+' : alerts.length}
                </span>
              )}
            </button>
            {open === 'alerts' && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#ccc5b9] bg-white shadow-xl">
                <div className="border-b border-[#ccc5b9]/40 px-4 py-3">
                  <p className="font-semibold text-[#252422]">Stock alerts</p>
                  <p className="text-xs text-[#403d39]">Products at or below their reorder level</p>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-[#403d39]">All products are well stocked.</li>
                  ) : (
                    alerts.map(p => (
                      <li key={p.id} className="flex items-center gap-3 border-b border-[#ccc5b9]/20 px-4 py-3 last:border-0">
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 ${p.status === 'Out of Stock' ? 'text-red-600' : 'text-yellow-600'}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#252422]">{p.name}</p>
                          <p className="text-xs text-[#403d39]">
                            {p.quantity} left · reorder at {p.reorder}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                <Link
                  href="/inventory?status=low"
                  onClick={() => setOpen(null)}
                  className="block border-t border-[#ccc5b9]/40 px-4 py-3 text-center text-sm font-medium text-[#eb5e28] hover:bg-[#fffcf2]"
                >
                  View inventory
                </Link>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label="Store profile"
              aria-expanded={open === 'profile'}
              onClick={() => setOpen(open === 'profile' ? null : 'profile')}
              className="rounded-lg p-2 text-[#403d39] transition-colors hover:bg-[#eb5e28]/10 hover:text-[#eb5e28]"
            >
              <Store className="h-5 w-5" />
            </button>
            {open === 'profile' && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#ccc5b9] bg-white p-4 shadow-xl">
                <p className="font-semibold text-[#252422]">{settings.businessName}</p>
                {settings.businessEmail && <p className="text-sm text-[#403d39]">{settings.businessEmail}</p>}
                {settings.businessPhone && <p className="text-sm text-[#403d39]">{settings.businessPhone}</p>}
                <Link
                  href="/settings"
                  onClick={() => setOpen(null)}
                  className="mt-3 block rounded-lg bg-[#eb5e28] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#d94a1f]"
                >
                  Store settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
