'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from '@/components/card';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export default function StatCard({ icon: Icon, label, value, change, className = '' , }: StatCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#403d39] mb-2">{label}</p>
          <p className="text-3xl font-bold text-[#252422]">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.type === 'increase' ? 'text-[#eb5e28]' : 'text-red-500'}`}>
              {change.type === 'increase' ? '↑' : '↓'} {change.value}%
            </p>
          )}
        </div>
        <div className="p-3 bg-[#eb5e28]/20 rounded-lg">
          <Icon className="w-6 h-6 text-[#eb5e28]" />
        </div>
      </div>
    </Card>
  );
}
