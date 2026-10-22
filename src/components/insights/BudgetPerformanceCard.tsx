import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { WalletCards, ChevronRight, Target } from 'lucide-react-native';
import { BudgetPerformanceSummary } from '@/types/analytics';
import { formatCentavosToPhp } from '@/utils/currency';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';

interface BudgetPerformanceCardProps {
  performance: BudgetPerformanceSummary;
}

export function BudgetPerformanceCard({
  performance,
}: BudgetPerformanceCardProps) {
  const handleViewBudgets = () => {
    router.push('/(tabs)/budgets');
  };

  return (
    <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 mb-6 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3.5 pb-2.5 border-b border-slate-700/50">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
            <Target size={15} color="#10B981" />
          </View>
          <View>
            <Text className="text-white font-bold text-base">
              Budget Performance
            </Text>
            <Text className="text-slate-400 text-[10px]">
              {performance.targetMonthLabel}
              {performance.isMultiMonthRange ? ' (Latest Month)' : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleViewBudgets}
          className="flex-row items-center bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60"
        >
          <Text className="text-slate-300 text-xs font-semibold mr-1">
            Budgets
          </Text>
          <ChevronRight size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {!performance.hasBudgets ? (
        <View className="py-6 items-center">
          <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mb-2.5">
            <WalletCards size={18} color="#94A3B8" />
          </View>
          <Text className="text-white text-xs font-bold">
            No budgets set for {performance.targetMonthLabel}
          </Text>
          <Text className="text-slate-400 text-[11px] text-center mt-1 mb-3 max-w-xs">
            Set up monthly limits to monitor spending progress here.
          </Text>
          <TouchableOpacity
            onPress={handleViewBudgets}
            className="bg-emerald-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-[#0B1220] font-bold text-xs">
              Set Up Budgets
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Main Budget Progress Block */}
          <View className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 mb-3.5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-300 text-xs font-semibold">
                {performance.hasOverallBudget
                  ? 'Overall Monthly Budget'
                  : 'Active Category Budgets'}
              </Text>
              <Text
                style={{ color: performance.statusColor }}
                className="text-xs font-bold"
              >
                {Math.round(performance.percentage)}% Used
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2.5">
              <View
                style={{
                  width: `${performance.cappedPercentage}%`,
                  backgroundColor: performance.statusColor,
                }}
                className="h-full rounded-full"
              />
            </View>

            {/* Spent vs Limit & Remaining */}
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-400 text-[11px]">
                Spent:{' '}
                <Text className="text-white font-bold">
                  {formatCentavosToPhp(performance.totalSpentCentavos)}
                </Text>{' '}
                /{' '}
                <Text className="text-slate-300">
                  {formatCentavosToPhp(performance.totalBudgetLimitCentavos)}
                </Text>
              </Text>

              <Text
                style={{
                  color: performance.isExceeded ? '#F87171' : '#10B981',
                }}
                className="text-[11px] font-bold"
              >
                {performance.isExceeded
                  ? `Exceeded by ${formatCentavosToPhp(
                      Math.abs(performance.remainingCentavos)
                    )}`
                  : `${formatCentavosToPhp(performance.remainingCentavos)} left`}
              </Text>
            </View>
          </View>

          {/* Top Approaching Categories */}
          {performance.topApproachingCategories.length > 0 && (
            <View>
              <Text className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                Top Categories by Utilization
              </Text>
              <View className="gap-2">
                {performance.topApproachingCategories.map((cat, idx) => (
                  <View
                    key={`budget-cat-stat-${idx}-${cat.categoryName}`}
                    className="flex-row items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-700/40"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <CategoryIcon
                        name={cat.categoryIcon}
                        color={cat.categoryColor}
                        size={14}
                      />
                      <Text
                        numberOfLines={1}
                        className="text-slate-200 text-xs font-medium ml-2 flex-1"
                      >
                        {cat.categoryName}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        style={{
                          color: cat.isExceeded ? '#F87171' : '#E2E8F0',
                        }}
                        className="text-xs font-bold"
                      >
                        {Math.round(cat.percentage)}%
                      </Text>
                      <Text className="text-slate-400 text-[10px]">
                        {formatCentavosToPhp(cat.spentCentavos)} /{' '}
                        {formatCentavosToPhp(cat.limitCentavos)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
