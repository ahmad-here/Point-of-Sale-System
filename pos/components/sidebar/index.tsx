'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import zlogo from '@/public/zlogo.png';
import { LayoutDashboard, Package, CreditCard, ShoppingCart, BarChart3, Settings, Users, Home } from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Register', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + '/');

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main navigation"
      className="no-print group/sidebar fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r border-white/5 bg-gradient-to-b from-[#252422] to-[#403d39] text-white transition-[width] duration-300 ease-out hover:w-64 md:flex"
    >
      <Link href="/" className="flex h-16 items-center gap-2 overflow-hidden pl-4" aria-label="TOSPOS home">
        <Image src={zlogo} alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" priority />
        <span className="whitespace-nowrap text-lg font-bold opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
          TOSPOS
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(item => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              className="relative flex h-11 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors hover:bg-[#eb5e28]/20"
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-full bg-[#eb5e28] shadow-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5 shrink-0" aria-hidden />
              <span className="relative z-10 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        title="Back to website"
        className="mx-3 mb-2 flex h-11 items-center gap-3 rounded-full px-3 text-sm text-[#ccc5b9] transition-colors hover:bg-white/10"
      >
        <Home className="h-5 w-5 shrink-0" aria-hidden />
        <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">Website</span>
      </Link>

      <div className="m-3 overflow-hidden rounded-xl bg-[#403d39]/60 p-3 opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
        <p className="text-xs text-[#ccc5b9]">Data storage</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          <span className="whitespace-nowrap text-xs text-[#ccc5b9]">Saved on this device</span>
        </div>
      </div>
    </aside>
  );
}

/** Bottom tab bar for phones and small tablets */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className="no-print fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-white/10 bg-[#252422] text-white md:hidden"
    >
      {navItems.map(item => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-w-[68px] flex-1 flex-col items-center gap-1 px-2 py-2 text-[11px] ${
              active ? 'text-[#eb5e28]' : 'text-[#ccc5b9]'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
