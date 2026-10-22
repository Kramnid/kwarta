import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CategorySpending } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { formatCurrentMonth } from '@/utils/date';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface SpendingOverviewProps {
  categories: CategorySpending[];
  totalExpensesCentavos: number;
  className?: string;
}

export function SpendingOverview({
  categories,
  totalExpensesCentavos,
  className = '',
}: SpendingOverviewProps) {
  const router = useRouter();
  const currentMonth = formatCurrentMonth();
  const formattedTotal = formatCentavosToPhp(totalExpensesCentavos);

  const handleViewInsights = () => {
    router.push('/(tabs)/insights');
  };

  return (
    <View className={`mb-6 ${className}`}>
      <SectionHeader
        title="Spending Overview"
        actionText="View Insights"
        onActionPress={handleViewInsights}
      />

      <View className="bg-[#151F30] rounded-3xl p-5 border border-slate-700/60 shadow-sm">
        {/* Top Summary Row: Month & Total Spending */}
        <View className="flex-row items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
          <View>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Monthly Spending
            </Text>
            <Text className="text-white text-base font-bold mt-0.5">
              {currentMonth}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-slate-400 text-xs font-medium">Total Spent</Text>
            <Text className="text-rose-400 text-xl font-extrabold tracking-tight mt-0.5">
              {formattedTotal}
            </Text>
          </View>
        </View>

        {/* Category Breakdown Progress Bars */}
        {categories.length === 0 ? (
          <View className="py-6 items-center justify-center">
            <Text className="text-slate-400 text-xs text-center">
              No expense activity recorded for this period.
            </Text>
          </View>
        ) : (
          <View className="gap-3.5">
            {categories.map((item) => {
              const formattedCategoryAmount = formatCentavosToPhp(item.amount);
              // Ensure bar width is clamped between 0% and 100%
              const clampedPercent = Math.min(Math.max(item.percentage, 0), 100);

              return (
                <View key={`cat-${item.categoryId}-${item.categoryName}`}>
                  {/* Category Title + Amount + Percentage */}
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        style={{ backgroundColor: item.categoryColor || '#94A3B8' }}
                        className="w-2.5 h-2.5 rounded-full mr-2"
                      />
                      <Text
                        numberOfLines={1}
                        className="text-slate-200 text-xs font-semibold"
                      >
                        {item.categoryName}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className="text-white text-xs font-bold mr-2">
                        {formattedCategoryAmount}
                      </Text>
                      <Text className="text-slate-400 text-[11px] font-medium w-10 text-right">
                        {clampedPercent.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Visual Progress Bar */}
                  <View className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <View
                      style={{
                        width: `${clampedPercent}%`,
                        backgroundColor: item.categoryColor || '#10B981',
                      }}
                      className="h-full rounded-full"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
