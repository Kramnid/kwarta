import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatMonthDisplay, getCurrentMonthString } from '@/utils/budget';

interface BudgetMonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onResetToCurrentMonth?: () => void;
  className?: string;
}

export function BudgetMonthSelector({
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onResetToCurrentMonth,
  className = '',
}: BudgetMonthSelectorProps) {
  const currentMonthStr = getCurrentMonthString();
  const isCurrentMonth = selectedMonth === currentMonthStr;
  const monthDisplay = formatMonthDisplay(selectedMonth);

  const handlePrev = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onPreviousMonth();
  };

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onNextMonth();
  };

  const handleReset = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }
    onResetToCurrentMonth?.();
  };

  return (
    <View className={`flex-row items-center justify-between bg-[#151F30] px-3 py-2 rounded-2xl border border-slate-700/60 shadow-sm ${className}`}>
      {/* Previous Month Button */}
      <Pressable
        onPress={handlePrev}
        hitSlop={8}
        className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 items-center justify-center active:bg-slate-700"
        accessibilityRole="button"
        accessibilityLabel="Previous month"
      >
        <ChevronLeft size={18} color="#94A3B8" />
      </Pressable>

      {/* Month Label & Current Indicator */}
      <View className="items-center justify-center">
        <View className="flex-row items-center">
          <Calendar size={13} color="#10B981" className="mr-1.5" />
          <Text className="text-white text-sm font-bold tracking-tight">
            {monthDisplay}
          </Text>
        </View>

        {!isCurrentMonth && onResetToCurrentMonth && (
          <Pressable
            onPress={handleReset}
            hitSlop={6}
            className="mt-0.5"
            accessibilityRole="button"
            accessibilityLabel="Jump to current month"
          >
            <Text className="text-emerald-400 text-[10px] font-semibold">
              Return to Current Month
            </Text>
          </Pressable>
        )}
      </View>

      {/* Next Month Button */}
      <Pressable
        onPress={handleNext}
        hitSlop={8}
        className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 items-center justify-center active:bg-slate-700"
        accessibilityRole="button"
        accessibilityLabel="Next month"
      >
        <ChevronRight size={18} color="#94A3B8" />
      </Pressable>
    </View>
  );
}
