'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="no-print absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative flex max-h-[92vh] w-full ${widths[size]} flex-col rounded-t-2xl bg-[#fffcf2] shadow-2xl sm:rounded-2xl`}
      >
        <div className="no-print flex items-center justify-between border-b border-[#ccc5b9]/40 px-5 py-4">
          <h2 className="text-lg font-bold text-[#252422]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-[#ccc5b9]/30">
            <X className="h-5 w-5 text-[#403d39]" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="no-print flex flex-wrap justify-end gap-2 border-t border-[#ccc5b9]/40 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
