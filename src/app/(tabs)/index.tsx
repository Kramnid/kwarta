import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store';
import {
  calculateDashboardSummary,
  calculateSpendingByCategory,
  getRecentTransactions,
} from '@/utils/finance';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SpendingOverview } from '@/components/dashboard/SpendingOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export default function HomeScreen() {
  const { transactions, refreshTransactions, isLoadingTransactions } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pure financial calculations derived from transactions
  const summary = useMemo(
    () => calculateDashboardSummary(transactions),
    [transactions]
  );

  const categoriesSpending = useMemo(
    () => calculateSpendingByCategory(transactions),
    [transactions]
  );

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
          paddingBottom: 36,
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
        {/* 1. Dashboard Header (Greeting, Title, Avatar) */}
        <DashboardHeader />

        {/* 2. Total Balance Card (Emerald Gradient, Balance in PHP) */}
        <BalanceCard
          balanceCentavos={summary.totalBalance}
          className="mb-4"
        />

        {/* 3. Income and Expense Summary (Side-by-side cards) */}
        <SummaryCard
          incomeCentavos={summary.totalIncome}
          expenseCentavos={summary.totalExpenses}
          className="mb-6"
        />

        {/* 4. Quick Actions (Add Expense, Add Income, View History) */}
        <QuickActions />

        {/* 5. Spending Overview (Category Progress Bars, View Insights) */}
        <SpendingOverview
          categories={categoriesSpending}
          totalExpensesCentavos={summary.totalExpenses}
        />

        {/* 6. Recent Transactions (Latest 5 Transactions or Empty State) */}
        <RecentTransactions transactions={recentTransactions} />
      </ScrollView>
    </SafeAreaView>
  );
}
