import React from 'react';
import { View } from 'react-native';
import { BudgetStatus } from '@/types/budget';
import { calculateBudgetStatus } from '@/utils/budget';

interface BudgetProgressBarProps {
  percentage: number;
  status?: BudgetStatus;
  height?: number;
  className?: string;
}

export function BudgetProgressBar({
  percentage,
  status,
  height = 8,
  className = '',
}: BudgetProgressBarProps) {
  const currentStatus = status || calculateBudgetStatus(percentage);
  const visualWidth = Math.min(100, Math.max(0, percentage));

  let barBg = 'bg-emerald-500';
  if (currentStatus === 'caution') {
    barBg = 'bg-amber-400';
  } else if (currentStatus === 'warning') {
    barBg = 'bg-orange-400';
  } else if (currentStatus === 'exceeded') {
    barBg = 'bg-red-400';
  }

  return (
    <View
      style={{ height }}
      className={`w-full bg-slate-800 rounded-full overflow-hidden ${className}`}
    >
      <View
        style={{ width: `${visualWidth}%`, height: '100%' }}
        className={`rounded-full transition-all ${barBg}`}
      />
    </View>
  );
}
