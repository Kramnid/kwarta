import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, ArrowRight, PlusCircle } from 'lucide-react-native';
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

  const handleViewAnalytics = () => {
    router.push('/(tabs)/analytics');
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/add-transaction',
      params: { type: 'expense' },
    });
  };

  // Display top 4 categories on dashboard to prevent vertical overload
  const topCategories = categories.slice(0, 4);
  const remainingCount = categories.length - topCategories.length;

  return (
    <View className={`mb-6 ${className}`}>
      <SectionHeader
        title="Spending Overview"
        actionText="View Analytics"
        onActionPress={handleViewAnalytics}
      />

      <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
        {/* Top Summary Row: Month & Total Spending */}
        <View className="flex-row items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
          <View>
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Monthly Spending
            </Text>
            <Text className="text-white text-base font-bold mt-0.5">
              {currentMonth}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-slate-400 text-[11px] font-medium">Total Spent</Text>
            <Text className="text-rose-400 text-xl font-extrabold tracking-tight mt-0.5">
              {formattedTotal}
            </Text>
          </View>
        </View>

        {/* Category Breakdown Progress Bars */}
        {categories.length === 0 ? (
          <View className="py-7 items-center justify-center">
            <View className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 items-center justify-center mb-3">
              <PieChart size={24} color="#64748B" />
            </View>
            <Text className="text-slate-300 text-sm font-semibold text-center mb-1">
              No expenses yet this month
            </Text>
            <Text className="text-slate-500 text-xs text-center max-w-[220px] mb-4">
              Log your daily spending to see your category breakdown.
            </Text>
            <Pressable
              onPress={handleAddExpense}
              className="flex-row items-center bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl active:bg-slate-700"
            >
              <PlusCircle size={15} color="#10B981" />
              <Text className="text-emerald-400 text-xs font-semibold ml-2">
                Log Expense
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            {topCategories.map((item) => {
              const formattedCategoryAmount = formatCentavosToPhp(item.amount);
              const clampedPercent = Math.min(Math.max(item.percentage, 0), 100);

              return (
                <View key={`cat-${item.categoryId}-${item.categoryName}`}>
                  {/* Category Title + Amount + Percentage */}
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        style={{ backgroundColor: item.categoryColor || '#10B981' }}
                        className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm"
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
                      <View className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                        <Text className="text-slate-300 text-[10px] font-bold">
                          {clampedPercent.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Visual Progress Bar */}
                  <View className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
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

            {/* Remaining categories prompt */}
            {remainingCount > 0 && (
              <Pressable
                onPress={handleViewAnalytics}
                className="flex-row items-center justify-center pt-2 mt-1 border-t border-slate-700/50 active:opacity-70"
              >
                <Text className="text-emerald-400 text-xs font-medium mr-1">
                  +{remainingCount} more categories in Analytics
                </Text>
                <ArrowRight size={13} color="#10B981" />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
