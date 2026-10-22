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
    <View className={`mb-6 ${className}`}>
      <SectionHeader title="Quick Actions" />

      <View className="flex-row gap-3">
        {/* Add Expense Action Tile */}
        <Pressable
          onPress={handleAddExpense}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
          className="flex-1 bg-[#171B2A] active:bg-rose-950/40 border border-rose-500/25 rounded-3xl py-4 px-2 items-center justify-center transition-all shadow-sm shadow-rose-950/20"
        >
          <View className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 items-center justify-center mb-2.5 shadow-sm">
            <Minus size={22} color="#F87171" strokeWidth={2.6} />
          </View>
          <Text className="text-white text-xs font-bold text-center">
            Expense
          </Text>
          <Text className="text-slate-400 text-[10px] text-center mt-0.5">
            Log outflow
          </Text>
        </Pressable>

        {/* Add Income Action Tile */}
        <Pressable
          onPress={handleAddIncome}
          accessibilityRole="button"
          accessibilityLabel="Add Income"
          className="flex-1 bg-[#122227] active:bg-emerald-950/40 border border-emerald-500/25 rounded-3xl py-4 px-2 items-center justify-center transition-all shadow-sm shadow-emerald-950/20"
        >
          <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-2.5 shadow-sm">
            <Plus size={22} color="#10B981" strokeWidth={2.6} />
          </View>
          <Text className="text-white text-xs font-bold text-center">
            Income
          </Text>
          <Text className="text-slate-400 text-[10px] text-center mt-0.5">
            Log inflow
          </Text>
        </Pressable>

        {/* View History Action Tile */}
        <Pressable
          onPress={handleViewHistory}
          accessibilityRole="button"
          accessibilityLabel="View Transaction History"
          className="flex-1 bg-[#151F30] active:bg-slate-800 border border-slate-700/70 rounded-3xl py-4 px-2 items-center justify-center transition-all shadow-sm"
        >
          <View className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-2.5 shadow-sm">
            <History size={20} color="#94A3B8" strokeWidth={2.2} />
          </View>
          <Text className="text-white text-xs font-bold text-center">
            History
          </Text>
          <Text className="text-slate-400 text-[10px] text-center mt-0.5">
            All records
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
