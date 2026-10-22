import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ChartNoAxesCombined, PieChart, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useAppStore } from '@/store';
import {
  calculateDashboardSummary,
  calculateSpendingByCategory,
} from '@/utils/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { formatCurrentMonth } from '@/utils/date';
import { Card } from '@/components/ui/Card';

export default function InsightsScreen() {
  const { transactions } = useAppStore();
  const currentMonth = formatCurrentMonth();

  const summary = useMemo(
    () => calculateDashboardSummary(transactions),
    [transactions]
  );

  const categories = useMemo(
    () => calculateSpendingByCategory(transactions),
    [transactions]
  );

  const savingsRate =
    summary.totalIncome > 0
      ? Math.max(0, Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100))
      : 0;

  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Month & Highlights */}
      <View className="mb-5">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {currentMonth}
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">
          Spending Analytics
        </Text>
      </View>

      {/* Cash Flow Highlights */}
      <View className="flex-row gap-3 mb-5">
        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60">
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#10B981" />
            <Text className="text-slate-400 text-xs font-semibold uppercase ml-1.5">
              Savings Rate
            </Text>
          </View>
          <Text className="text-emerald-400 text-2xl font-extrabold">
            {savingsRate}%
          </Text>
          <Text className="text-slate-400 text-[11px] mt-0.5">
            of income preserved
          </Text>
        </View>

        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60">
          <View className="flex-row items-center mb-2">
            <TrendingDown size={16} color="#F87171" />
            <Text className="text-slate-400 text-xs font-semibold uppercase ml-1.5">
              Net Expenses
            </Text>
          </View>
          <Text className="text-rose-400 text-2xl font-extrabold">
            {formatCentavosToPhp(summary.totalExpenses)}
          </Text>
          <Text className="text-slate-400 text-[11px] mt-0.5">
            across {categories.length} categories
          </Text>
        </View>
      </View>

      {/* Category Distribution Breakdown */}
      <Card className="mb-6">
        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
          <View className="flex-row items-center">
            <PieChart size={18} color="#10B981" />
            <Text className="text-white font-bold text-base ml-2">
              Category Distribution
            </Text>
          </View>
          <Text className="text-slate-400 text-xs font-semibold">
            By Percentage
          </Text>
        </View>

        {categories.length === 0 ? (
          <View className="py-8 items-center justify-center">
            <Text className="text-slate-400 text-xs text-center">
              No expense activity recorded yet.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {categories.map((item) => (
              <View key={`insight-cat-${item.categoryId}-${item.categoryName}`}>
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      style={{ backgroundColor: item.categoryColor || '#94A3B8' }}
                      className="w-3 h-3 rounded-full mr-2.5"
                    />
                    <Text className="text-slate-200 text-xs font-semibold">
                      {item.categoryName}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-white text-xs font-bold mr-2">
                      {formatCentavosToPhp(item.amount)}
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                      backgroundColor: item.categoryColor || '#10B981',
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Next Steps Card */}
      <Card elevated>
        <View className="flex-row items-center mb-2">
          <ChartNoAxesCombined size={16} color="#10B981" />
          <Text className="text-white font-semibold text-sm ml-2">
            Interactive Visualizations
          </Text>
        </View>
        <Text className="text-slate-400 text-xs leading-5">
          Detailed monthly trend charts, category breakdowns, and custom budget limits are coming in future updates.
        </Text>
      </Card>
    </ScrollView>
  );
}
