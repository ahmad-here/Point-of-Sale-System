'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from '@/components/card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Real period-over-period change. Omit when there is no comparison data. */
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    label?: string;
  };
  hint?: string;
  className?: string;
}

export default function StatCard({ icon: Icon, label, value, change, hint, className = '' }: StatCardProps) {
  return (
    <Card className={`p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm text-[#403d39]">{label}</p>
          <p className="truncate text-2xl font-bold text-[#252422] sm:text-3xl">{value}</p>
          {change && (
            <p className={`mt-2 text-sm ${change.type === 'increase' ? 'text-green-700' : 'text-red-600'}`}>
              {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value).toFixed(1)}%{' '}
              <span className="text-[#403d39]">{change.label ?? 'vs previous period'}</span>
            </p>
          )}
          {hint && !change && <p className="mt-2 text-sm text-[#403d39]">{hint}</p>}
        </div>
        <div className="shrink-0 rounded-lg bg-[#eb5e28]/20 p-3">
          <Icon className="h-6 w-6 text-[#eb5e28]" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
