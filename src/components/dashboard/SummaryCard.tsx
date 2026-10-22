import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { formatCentavosToPhp } from '@/utils/currency';

interface SummaryCardProps {
  incomeCentavos: number;
  expenseCentavos: number;
  className?: string;
}

export function SummaryCard({
  incomeCentavos,
  expenseCentavos,
  className = '',
}: SummaryCardProps) {
  const formattedIncome = formatCentavosToPhp(incomeCentavos);
  const formattedExpense = formatCentavosToPhp(expenseCentavos);

  return (
    <View className={`flex-row gap-3.5 ${className}`}>
      {/* Income Card */}
      <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 items-center justify-center mr-2.5">
            <ArrowDownLeft size={16} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Income
          </Text>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-white text-lg font-extrabold tracking-tight"
        >
          {formattedIncome}
        </Text>
      </View>

      {/* Expense Card */}
      <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 items-center justify-center mr-2.5">
            <ArrowUpRight size={16} color="#F87171" strokeWidth={2.5} />
          </View>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Expenses
          </Text>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-white text-lg font-extrabold tracking-tight"
        >
          {formattedExpense}
        </Text>
      </View>
    </View>
  );
}
