import React from 'react';
import { View, Text } from 'react-native';
import { BudgetStatus } from '@/types/budget';
import { getBudgetStatusLabel } from '@/utils/budget';

interface BudgetStatusBadgeProps {
  status: BudgetStatus;
  className?: string;
}

export function BudgetStatusBadge({
  status,
  className = '',
}: BudgetStatusBadgeProps) {
  const label = getBudgetStatusLabel(status);

  let badgeStyle = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  if (status === 'caution') {
    badgeStyle = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
  } else if (status === 'warning') {
    badgeStyle = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
  } else if (status === 'exceeded') {
    badgeStyle = 'bg-red-500/15 border-red-500/30 text-red-400';
  }

  return (
    <View
      className={`px-2.5 py-0.5 rounded-full border items-center justify-center ${badgeStyle} ${className}`}
    >
      <Text className={`text-[11px] font-bold tracking-wide uppercase ${badgeStyle.split(' ').pop()}`}>
        {label}
      </Text>
    </View>
  );
}
