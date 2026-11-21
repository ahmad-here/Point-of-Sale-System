'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import zlogo from '@/public/zlogo.png';

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/guides', label: 'Guides' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#ccc5b9]/40 bg-[#fffcf2]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="TOSPOS home">
          <Image src={zlogo} alt="" width={44} height={44} className="h-11 w-11 object-contain" priority />
          <span className="text-xl font-bold text-[#252422]">TOSPOS</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-[#403d39] transition hover:text-[#eb5e28]">
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" className="rounded-lg bg-[#eb5e28] px-4 py-2 font-semibold text-white shadow transition hover:bg-[#d94a1f]">
            Open POS
          </Link>
        </nav>
        <button type="button" className="rounded-lg p-2 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav aria-label="Primary mobile" className="border-t border-[#ccc5b9]/40 bg-[#fffcf2] px-4 pb-4 md:hidden">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-[#ccc5b9]/30 py-3 text-[#403d39]">
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-4 block rounded-lg bg-[#eb5e28] px-4 py-3 text-center font-semibold text-white">
            Open POS
          </Link>
        </nav>
      )}
    </header>
  );
}
