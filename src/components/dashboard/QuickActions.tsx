import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, History } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className = '' }: QuickActionsProps) {
  const router = useRouter();

  const handleAddExpense = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    <View className={`mb-5 ${className}`}>
      <View className="flex-row items-center justify-around bg-[#151F30] rounded-2xl py-3 px-2 border border-slate-700/60 shadow-sm">
        {/* Action 1: Add Expense */}
        <Pressable
          onPress={handleAddExpense}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
          className="items-center flex-1 active:opacity-60"
        >
          <View className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 items-center justify-center mb-1.5 shadow-sm">
            <Minus size={22} color="#F87171" strokeWidth={2.6} />
          </View>
          <Text className="text-slate-100 text-xs font-semibold text-center">
            Expense
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="w-[1px] h-9 bg-slate-800" />

        {/* Action 2: Add Income */}
        <Pressable
          onPress={handleAddIncome}
          accessibilityRole="button"
          accessibilityLabel="Add Income"
          className="items-center flex-1 active:opacity-60"
        >
          <View className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-1.5 shadow-sm">
            <Plus size={22} color="#10B981" strokeWidth={2.6} />
          </View>
          <Text className="text-slate-100 text-xs font-semibold text-center">
            Income
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="w-[1px] h-9 bg-slate-800" />

        {/* Action 3: History */}
        <Pressable
          onPress={handleViewHistory}
          accessibilityRole="button"
          accessibilityLabel="View Transaction History"
          className="items-center flex-1 active:opacity-60"
        >
          <View className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 items-center justify-center mb-1.5 shadow-sm">
            <History size={20} color="#94A3B8" strokeWidth={2.2} />
          </View>
          <Text className="text-slate-100 text-xs font-semibold text-center">
            History
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
