import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, History } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className = '' }: QuickActionsProps) {
  const router = useRouter();

  const handleAddExpense = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push({
      pathname: '/add-transaction',
      params: { type: 'expense' },
    });
  };

  const handleAddIncome = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push({
      pathname: '/add-transaction',
      params: { type: 'income' },
    });
  };

  const handleViewHistory = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push('/(tabs)/transactions');
  };

  return (
    <View className={`mb-6 ${className}`}>
      <SectionHeader title="Quick Actions" />

      <View className="flex-row gap-3">
        {/* Add Expense Action Tile */}
        <Pressable
          onPress={handleAddExpense}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
          className="flex-1 bg-[#151F30] active:bg-slate-800 border border-slate-700/60 rounded-2xl py-3.5 px-2 items-center justify-center transition-all shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 items-center justify-center mb-2">
            <Minus size={20} color="#F87171" strokeWidth={2.5} />
          </View>
          <Text className="text-white text-xs font-semibold text-center">
            Add Expense
          </Text>
        </Pressable>

        {/* Add Income Action Tile */}
        <Pressable
          onPress={handleAddIncome}
          accessibilityRole="button"
          accessibilityLabel="Add Income"
          className="flex-1 bg-[#151F30] active:bg-slate-800 border border-slate-700/60 rounded-2xl py-3.5 px-2 items-center justify-center transition-all shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-2">
            <Plus size={20} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text className="text-white text-xs font-semibold text-center">
            Add Income
          </Text>
        </Pressable>

        {/* View History Action Tile */}
        <Pressable
          onPress={handleViewHistory}
          accessibilityRole="button"
          accessibilityLabel="View Transaction History"
          className="flex-1 bg-[#151F30] active:bg-slate-800 border border-slate-700/60 rounded-2xl py-3.5 px-2 items-center justify-center transition-all shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-slate-700/50 border border-slate-600/40 items-center justify-center mb-2">
            <History size={19} color="#94A3B8" strokeWidth={2.2} />
          </View>
          <Text className="text-white text-xs font-semibold text-center">
            View History
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
