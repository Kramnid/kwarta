import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionType } from '@/types/finance';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
}

export function TransactionTypeSelector({
  value,
  onChange,
  className = '',
}: TransactionTypeSelectorProps) {
  const handleSelect = (nextType: TransactionType) => {
    if (nextType !== value) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback
      }
      onChange(nextType);
    }
  };

  return (
    <View
      className={`flex-row bg-[#151F30] p-1.5 rounded-2xl mb-4 border border-slate-700/60 shadow-sm ${className}`}
    >
      {/* Expense Segment */}
      <Pressable
        onPress={() => handleSelect('expense')}
        accessibilityRole="button"
        accessibilityLabel="Expense mode"
        className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl transition-all ${
          value === 'expense'
            ? 'bg-red-500/20 border border-red-500/40 shadow-sm'
            : 'active:bg-slate-800/40'
        }`}
      >
        <ArrowDownCircle
          size={18}
          color={value === 'expense' ? '#F87171' : '#94A3B8'}
          strokeWidth={2.2}
        />
        <Text
          className={`ml-2 font-bold text-sm ${
            value === 'expense' ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          Expense
        </Text>
      </Pressable>

      {/* Income Segment */}
      <Pressable
        onPress={() => handleSelect('income')}
        accessibilityRole="button"
        accessibilityLabel="Income mode"
        className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl transition-all ${
          value === 'income'
            ? 'bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
            : 'active:bg-slate-800/40'
        }`}
      >
        <ArrowUpCircle
          size={18}
          color={value === 'income' ? '#10B981' : '#94A3B8'}
          strokeWidth={2.2}
        />
        <Text
          className={`ml-2 font-bold text-sm ${
            value === 'income' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}
