import React from 'react';
import { View, Text } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import { splitCentavosToPhp } from '@/utils/currency';

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
  const income = splitCentavosToPhp(incomeCentavos);
  const expense = splitCentavosToPhp(expenseCentavos);

  return (
    <View className={`flex-row gap-3 ${className}`}>
      {/* Income Card */}
      <View className="flex-1 bg-[#151F30] rounded-2xl p-3.5 border border-slate-700/60 shadow-sm">
        <View className="flex-row items-center mb-2.5">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-2">
            <ArrowUp size={15} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Income
          </Text>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-emerald-400 text-lg font-black tracking-tight"
        >
          {`+${income.symbol} ${income.formattedAmount}`}
        </Text>
        <Text className="text-slate-400 text-[11px] mt-0.5">
          Total received
        </Text>
      </View>

      {/* Expense Card */}
      <View className="flex-1 bg-[#151F30] rounded-2xl p-3.5 border border-slate-700/60 shadow-sm">
        <View className="flex-row items-center mb-2.5">
          <View className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 items-center justify-center mr-2">
            <ArrowDown size={15} color="#F87171" strokeWidth={2.5} />
          </View>
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Expenses
          </Text>
        </View>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-rose-400 text-lg font-black tracking-tight"
        >
          {`-${expense.symbol} ${expense.formattedAmount}`}
        </Text>
        <Text className="text-slate-400 text-[11px] mt-0.5">
          Total spent
        </Text>
      </View>
    </View>
  );
}
