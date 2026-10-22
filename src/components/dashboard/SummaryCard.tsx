import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { formatCentavosToPhp } from '@/utils/currency';
import { useAppStore } from '@/store';

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
  const { isBalanceHidden } = useAppStore();
  const formattedIncome = formatCentavosToPhp(incomeCentavos);
  const formattedExpense = formatCentavosToPhp(expenseCentavos);

  return (
    <View className={`flex-row gap-3.5 ${className}`}>
      {/* Income Card */}
      <View className="flex-1 bg-[#151F30] rounded-3xl p-4 border border-emerald-500/20 shadow-sm relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-2">
              <ArrowDownLeft size={16} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Income
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-emerald-400 text-lg font-extrabold tracking-tight"
        >
          {isBalanceHidden ? '₱ ••••••' : `+${formattedIncome}`}
        </Text>
        <Text className="text-slate-500 text-[11px] font-medium mt-0.5">
          Total received
        </Text>
      </View>

      {/* Expense Card */}
      <View className="flex-1 bg-[#151F30] rounded-3xl p-4 border border-rose-500/20 shadow-sm relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <View className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 items-center justify-center mr-2">
              <ArrowUpRight size={16} color="#F87171" strokeWidth={2.5} />
            </View>
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Expenses
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-rose-400 text-lg font-extrabold tracking-tight"
        >
          {isBalanceHidden ? '₱ ••••••' : `-${formattedExpense}`}
        </Text>
        <Text className="text-slate-500 text-[11px] font-medium mt-0.5">
          Total spent
        </Text>
      </View>
    </View>
  );
}
