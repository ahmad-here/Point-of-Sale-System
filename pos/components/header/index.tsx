'use client';

import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#ccc5b9]/30 bg-gradient-to-r from-[#fffcf2] to-[#ccc5b9]/30 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#252422]">{title}</h1>
          {subtitle && <p className="text-sm text-[#403d39] mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#eb5e28]/10 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[#403d39] hover:text-[#eb5e28]" />
          </button>
          <button className="p-2 hover:bg-[#eb5e28]/10 rounded-lg transition-colors">
            <User className="w-5 h-5 text-[#403d39] hover:text-[#eb5e28]" />
          </button>
        </div>
      </div>
    </header>
  );
}
