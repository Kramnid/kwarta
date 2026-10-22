import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pencil } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BudgetCalculation, Budget } from '@/types/budget';
import { formatCentavosToPhp } from '@/utils/currency';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import { BudgetWarning } from './BudgetWarning';

interface BudgetCategoryCardProps {
  calculation: BudgetCalculation;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  className?: string;
}

export function BudgetCategoryCard({
  calculation,
  onEdit,
  onDelete,
  className = '',
}: BudgetCategoryCardProps) {
  const { budget, spentCentavos, budgetLimitCentavos, remainingCentavos, percentage, status, isExceeded, warningMessage } =
    calculation;

  const category = budget.category;
  const categoryName = category?.name || 'Category';
  const categoryColor = category?.color || '#10B981';

  const formattedLimit = formatCentavosToPhp(budgetLimitCentavos);
  const formattedSpent = formatCentavosToPhp(spentCentavos);
  const remainingText = isExceeded
    ? `Exceeded by ${formatCentavosToPhp(Math.abs(remainingCentavos))}`
    : `${formatCentavosToPhp(remainingCentavos)} left`;

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onEdit(budget);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm active:bg-slate-800/80 transition-all ${className}`}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName} budget, ${percentage.toFixed(1)}% used`}
    >
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          {/* Category Icon */}
          <View
            style={{ backgroundColor: `${categoryColor}1F` }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-white/10 mr-3 shadow-sm"
          >
            <CategoryIcon
              name={category?.icon}
              color={categoryColor}
              size={19}
            />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-white text-sm font-bold tracking-tight"
            >
              {categoryName}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5 font-medium">
              Limit: {formattedLimit}
            </Text>
          </View>
        </View>

        {/* Right Badge & Quick Actions */}
        <View className="flex-row items-center gap-2">
          <BudgetStatusBadge status={status} />
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onEdit(budget);
            }}
            hitSlop={8}
            className="w-7 h-7 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
            accessibilityLabel={`Edit ${categoryName} budget`}
          >
            <Pencil size={12} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <BudgetProgressBar
        percentage={percentage}
        status={status}
        height={7}
        className="mb-2.5"
      />

      {/* Spending Breakdown Numbers */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline">
          <Text className="text-slate-200 text-xs font-bold">
            {formattedSpent}
          </Text>
          <Text className="text-slate-500 text-[11px] font-medium ml-1">
            spent
          </Text>
        </View>

        <Text
          className={`text-xs font-bold ${
            isExceeded ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          {remainingText} ({percentage.toFixed(1)}%)
        </Text>
      </View>

      {/* Threshold Warning Banner */}
      {warningMessage && (
        <BudgetWarning
          message={warningMessage}
          status={status}
          className="mt-3"
        />
      )}
    </Pressable>
  );
}
