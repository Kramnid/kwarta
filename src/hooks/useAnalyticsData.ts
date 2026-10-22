/**
 * Custom React Hook for Reactive Kwarta Analytics & Spending Insights
 *
 * Subscribes directly to Zustand stores (transactions, budgets).
 * Memoizes all aggregations and derived metrics.
 * Updates instantly when any transaction or budget is added, modified, or deleted.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAppStore, useBudgetStore } from '@/store';
import {
  AnalyticsDateRangeOption,
  AnalyticsData,
} from '@/types/analytics';
import {
  resolveDateRange,
  calculatePeriodOverview,
  calculateAverageDailySpending,
  generateIncomeExpenseBuckets,
  calculatePeriodCategorySpending,
  generateSpendingTrendPoints,
  generateFinancialInsights,
  calculatePeriodBudgetPerformance,
} from '@/utils/analytics';
import { getTodayLocalDate } from '@/utils/date';

export function useAnalyticsData() {
  const [selectedOption, setSelectedOption] =
    useState<AnalyticsDateRangeOption>('this_month');

  const today = getTodayLocalDate();
  const [customStartDate, setCustomStartDate] = useState<string>(today);
  const [customEndDate, setCustomEndDate] = useState<string>(today);

  // Store subscriptions
  const transactions = useAppStore((state) => state.transactions);
  const isLoadingTransactions = useAppStore(
    (state) => state.isLoadingTransactions
  );
  const refreshTransactions = useAppStore(
    (state) => state.refreshTransactions
  );
  const dbError = useAppStore((state) => state.dbError);

  const budgets = useBudgetStore((state) => state.budgets);
  const isLoadingBudgets = useBudgetStore((state) => state.isLoadingBudgets);
  const refreshBudgets = useBudgetStore((state) => state.refreshBudgets);
  const budgetError = useBudgetStore((state) => state.budgetError);

  // Resolved date range
  const range = useMemo(() => {
    return resolveDateRange(selectedOption, customStartDate, customEndDate);
  }, [selectedOption, customStartDate, customEndDate]);

  // Financial overview
  const overview = useMemo(() => {
    return calculatePeriodOverview(
      transactions,
      range.startDate,
      range.endDate
    );
  }, [transactions, range.startDate, range.endDate]);

  // Daily spending average
  const dailySpending = useMemo(() => {
    return calculateAverageDailySpending(
      overview.totalExpenses,
      range.startDate,
      range.endDate
    );
  }, [overview.totalExpenses, range.startDate, range.endDate]);

  // Income vs Expenses grouped buckets
  const incomeExpenseBuckets = useMemo(() => {
    return generateIncomeExpenseBuckets(transactions, range);
  }, [transactions, range]);

  // Category spending breakdown
  const categorySpending = useMemo(() => {
    return calculatePeriodCategorySpending(
      transactions,
      range.startDate,
      range.endDate
    );
  }, [transactions, range.startDate, range.endDate]);

  // Spending trend points
  const spendingTrendPoints = useMemo(() => {
    return generateSpendingTrendPoints(transactions, range);
  }, [transactions, range]);

  // Rule-based insights
  const insights = useMemo(() => {
    return generateFinancialInsights(transactions, range, budgets);
  }, [transactions, range, budgets]);

  // Budget performance overview
  const budgetPerformance = useMemo(() => {
    return calculatePeriodBudgetPerformance(transactions, budgets, range);
  }, [transactions, budgets, range]);

  // Unified analytics data object
  const analytics: AnalyticsData = useMemo(() => {
    return {
      range,
      overview,
      dailySpending,
      incomeExpenseBuckets,
      categorySpending,
      spendingTrendPoints,
      insights,
      budgetPerformance,
      hasAnyTransactions: transactions.length > 0,
      hasExpenses: overview.totalExpenses > 0,
      hasIncome: overview.totalIncome > 0,
    };
  }, [
    range,
    overview,
    dailySpending,
    incomeExpenseBuckets,
    categorySpending,
    spendingTrendPoints,
    insights,
    budgetPerformance,
    transactions.length,
  ]);

  // Range actions
  const setRangeOption = useCallback((option: AnalyticsDateRangeOption) => {
    setSelectedOption(option);
  }, []);

  const setCustomRange = useCallback((start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setSelectedOption('custom');
  }, []);

  // Refresh both sources of truth
  const refresh = useCallback(async () => {
    await Promise.all([refreshTransactions(), refreshBudgets()]);
  }, [refreshTransactions, refreshBudgets]);

  return {
    analytics,
    selectedOption,
    customStartDate,
    customEndDate,
    setRangeOption,
    setCustomRange,
    refresh,
    isLoading: isLoadingTransactions || isLoadingBudgets,
    error: dbError || budgetError,
  };
}
