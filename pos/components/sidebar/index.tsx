'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import zlogo from "@/public/zlogo.png"
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // Only show sidebar on admin routes
  const adminRoutes = ['/dashboard', '/inventory', '/payments', '/sales', '/analytics', '/settings'];
  const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  if (!isAdminRoute) return null;

  return (
    <aside className="group/sidebar fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r border-white/5 bg-gradient-to-b from-[#252422] to-[#403d39] text-white transition-[width] duration-300 ease-out hover:w-64 md:flex">
      
      {/* Logo Section */}
      <div className="flex h-16 pl-4 items-center overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg text-white font-bold text-lg">
          <img src={zlogo.src} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <span className="whitespace-nowrap font-display text-lg font-bold opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
          TOSPOS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex h-11 items-center gap-3 rounded-[100px] px-3 text-sm font-medium transition-colors hover:bg-[#eb5e28]/20"
            >
              {/* Active Border */}
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-[100px] border border-[#eb5e28]/40 shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Active Background */}
              {active && (
                <motion.div
                  className="absolute inset-0 rounded-[100px] bg-[#eb5e28] backdrop-blur-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />

              {/* Label */}
              <span className="relative z-10 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Status Card */}
      <div className="m-3 overflow-hidden rounded-xl bg-[#403d39]/60 p-3 opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
        <p className="text-xs text-[#ccc5b9]">System Status</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#eb5e28] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#eb5e28]" />
          </span>
          <span className="text-xs text-[#ccc5b9]">Online</span>
        </div>
      </div>
    </aside>
  );
}