import React from 'react';
import { View, Text } from 'react-native';
import { WalletCards, PlusCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface BudgetEmptyStateProps {
  isMonthSpecific?: boolean;
  monthName?: string;
  onCreateBudget: () => void;
  className?: string;
}

export function BudgetEmptyState({
  isMonthSpecific = false,
  monthName,
  onCreateBudget,
  className = '',
}: BudgetEmptyStateProps) {
  const title = isMonthSpecific
    ? `No budgets for ${monthName || 'this month'}`
    : 'No budgets yet';

  const description = isMonthSpecific
    ? 'Set a spending limit to stay on track and prevent overspending.'
    : 'Create your first budget and start managing your spending.';

  return (
    <View
      className={`py-12 px-6 items-center justify-center bg-[#151F30] rounded-3xl border border-slate-700/60 shadow-sm ${className}`}
    >
      <View className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 items-center justify-center mb-4">
        <WalletCards size={32} color="#10B981" />
      </View>

      <Text className="text-white text-lg font-bold text-center mb-1.5">
        {title}
      </Text>

      <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-5 mb-6">
        {description}
      </Text>

      <Button
        title="Create Budget"
        size="md"
        onPress={onCreateBudget}
        leftIcon={<PlusCircle size={18} color="#FFFFFF" />}
      />
    </View>
  );
}
