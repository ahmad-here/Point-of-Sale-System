'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-[#eb5e28]/20 text-[#eb5e28] border border-[#eb5e28]/30',
    warning: 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-700 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-700 border border-blue-500/30',
    default: 'bg-[#ccc5b9]/30 text-[#403d39] border border-[#ccc5b9]/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
