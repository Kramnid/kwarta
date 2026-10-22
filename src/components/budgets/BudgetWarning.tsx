import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, AlertCircle } from 'lucide-react-native';
import { BudgetStatus } from '@/types/budget';

interface BudgetWarningProps {
  message: string;
  status: BudgetStatus;
  className?: string;
}

export function BudgetWarning({
  message,
  status,
  className = '',
}: BudgetWarningProps) {
  if (!message || status === 'healthy') return null;

  let bgClass = 'bg-amber-500/10 border-amber-500/30';
  let textClass = 'text-amber-300';
  let iconColor = '#FBBF24';

  if (status === 'warning') {
    bgClass = 'bg-orange-500/10 border-orange-500/30';
    textClass = 'text-orange-300';
    iconColor = '#FB923C';
  } else if (status === 'exceeded') {
    bgClass = 'bg-red-500/10 border-red-500/30';
    textClass = 'text-red-300';
    iconColor = '#F87171';
  }

  const IconComponent = status === 'exceeded' ? AlertCircle : AlertTriangle;

  return (
    <View
      className={`flex-row items-center px-3 py-2 rounded-xl border ${bgClass} ${className}`}
    >
      <IconComponent size={14} color={iconColor} className="mr-2" />
      <Text className={`text-xs font-medium flex-1 ${textClass}`}>
        {message}
      </Text>
    </View>
  );
}
