import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store';
import {
  calculateDashboardSummary,
  calculateSpendingByCategory,
  calculateTotalExpenses,
  getRecentTransactions,
  getEffectiveDate,
} from '@/utils/finance';
import { isDateInThisMonth } from '@/utils/date';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardBudgetWidget } from '@/components/dashboard/DashboardBudgetWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingOverview } from '@/components/dashboard/SpendingOverview';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, refreshTransactions, isLoadingTransactions } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Overall financial summary
  const summary = useMemo(
    () => calculateDashboardSummary(transactions),
    [transactions]
  );

  // Current calendar month spending overview
  const currentMonthTransactions = useMemo(
    () => transactions.filter((t) => isDateInThisMonth(getEffectiveDate(t))),
    [transactions]
  );

  const monthlyExpenses = useMemo(
    () => calculateTotalExpenses(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const categoriesSpending = useMemo(
    () => calculateSpendingByCategory(currentMonthTransactions),
    [currentMonthTransactions]
  );

  // 5 newest transactions
  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions, 5),
    [transactions]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransactions]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingTransactions}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* 1. Dashboard Header (Greeting, Date, Avatar) */}
        <DashboardHeader />

        {/* 2. Total Balance Card (Emerald Gradient, Balance with separate symbol) */}
        <BalanceCard
          balanceCentavos={summary.totalBalance}
          className="mb-3.5"
        />

        {/* 3. Income and Expense Summary (Side-by-side sleek cards) */}
        <SummaryCard
          incomeCentavos={summary.totalIncome}
          expenseCentavos={summary.totalExpenses}
          className="mb-4"
        />

        {/* 4. Quick Actions (Compact dock with Expense, Income, History) */}
        <QuickActions className="mb-5" />

        {/* 5. Monthly Budget Widget (Compact overall monthly budget progress) */}
        <DashboardBudgetWidget className="mb-5" />

        {/* 6. Recent Transactions (Placed prominently above monthly analytics) */}
        <RecentTransactions
          transactions={recentTransactions}
          onTransactionPress={(tx) =>
            router.push({
              pathname: '/transaction/[id]',
              params: { id: tx.id },
            } as any)
          }
          className="mb-5"
        />

        {/* 6. Spending Overview (Category Progress Bars for Current Month) */}
        <SpendingOverview
          categories={categoriesSpending}
          totalExpensesCentavos={monthlyExpenses}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
