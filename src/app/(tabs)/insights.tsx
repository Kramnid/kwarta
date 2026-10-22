import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Lightbulb } from 'lucide-react-native';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { InsightsHeader } from '@/components/insights/InsightsHeader';
import { DateRangeSelector } from '@/components/insights/DateRangeSelector';
import { FinancialOverviewCards } from '@/components/insights/FinancialOverviewCards';
import { IncomeExpenseChart } from '@/components/insights/IncomeExpenseChart';
import { SpendingBreakdownChart } from '@/components/insights/SpendingBreakdownChart';
import { SpendingTrendsChart } from '@/components/insights/SpendingTrendsChart';
import { FinancialInsightCard } from '@/components/insights/FinancialInsightCard';
import { BudgetPerformanceCard } from '@/components/insights/BudgetPerformanceCard';
import { InsightsEmptyState } from '@/components/insights/InsightsEmptyState';

export default function InsightsScreen() {
  const {
    analytics,
    selectedOption,
    customStartDate,
    customEndDate,
    setRangeOption,
    setCustomRange,
    refresh,
    error,
  } = useAnalyticsData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* 1. Header */}
        <InsightsHeader />

        {/* 2. Date Range Selector */}
        <DateRangeSelector
          selectedOption={selectedOption}
          onSelectOption={(option) => {
            setSelectedCategoryId(null);
            setRangeOption(option);
          }}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onSetCustomRange={(start, end) => {
            setSelectedCategoryId(null);
            setCustomRange(start, end);
          }}
          activeRange={analytics.range}
        />

        {/* Error State */}
        {error && (
          <InsightsEmptyState
            type="error"
            errorMessage={error}
            onRetry={handleRefresh}
          />
        )}

        {/* Empty State: No Transactions Recorded */}
        {!error && !analytics.hasAnyTransactions && (
          <InsightsEmptyState type="no_transactions" />
        )}

        {/* Content Loaded */}
        {!error && analytics.hasAnyTransactions && (
          <>
            {/* 3. Financial Overview Cards (Income, Expenses, Net Flow, Savings Rate, Daily Average) */}
            <FinancialOverviewCards
              overview={analytics.overview}
              dailySpending={analytics.dailySpending}
            />

            {/* 4. Income vs. Expenses Chart */}
            <IncomeExpenseChart buckets={analytics.incomeExpenseBuckets} />

            {/* 5. Spending Breakdown (Donut Chart + Integrated Ranked Categories) */}
            <SpendingBreakdownChart
              categories={analytics.categorySpending}
              totalExpenses={analytics.overview.totalExpenses}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            {/* 6. Spending Trends Chart */}
            <SpendingTrendsChart points={analytics.spendingTrendPoints} />

            {/* 7. Smart Financial Insights ("Your Money Insights") */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
                  <Lightbulb size={15} color="#10B981" />
                </View>
                <Text className="text-white font-bold text-base">
                  Your Money Insights
                </Text>
              </View>

              {analytics.insights.length > 0 ? (
                analytics.insights.map((insight) => (
                  <FinancialInsightCard key={insight.id} insight={insight} />
                ))
              ) : (
                <View className="bg-[#151F30] rounded-xl p-4 border border-slate-700/60">
                  <Text className="text-slate-400 text-xs text-center">
                    No special observations for this period.
                  </Text>
                </View>
              )}
            </View>

            {/* 8. Budget Performance Card */}
            <BudgetPerformanceCard performance={analytics.budgetPerformance} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
