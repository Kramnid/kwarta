import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Tag, RefreshCw } from 'lucide-react-native';
import { useAppStore } from '@/store';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Budget } from '@/types/budget';
import {
  calculateBudgetDetails,
  calculateMonthlyOverview,
  formatMonthDisplay,
} from '@/utils/budget';
import { Button } from '@/components/ui/Button';
import { BudgetMonthSelector } from '@/components/budgets/BudgetMonthSelector';
import { BudgetOverviewCard } from '@/components/budgets/BudgetOverviewCard';
import { BudgetCategoryCard } from '@/components/budgets/BudgetCategoryCard';
import { BudgetEmptyState } from '@/components/budgets/BudgetEmptyState';
import { DeleteBudgetConfirmModal } from '@/components/budgets/DeleteBudgetConfirmModal';

export default function BudgetsScreen() {
  const router = useRouter();
  const { transactions, refreshTransactions } = useAppStore();
  const {
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    budgets,
    isLoadingBudgets,
    budgetError,
    refreshBudgets,
    deleteBudget,
  } = useBudgetStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshBudgets(), refreshTransactions()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshBudgets, refreshTransactions]);

  // 1. Budgets for selected month
  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // 2. Monthly overview calculation
  const monthlyOverview = useMemo(() => {
    return calculateMonthlyOverview(monthBudgets, transactions, selectedMonth);
  }, [monthBudgets, transactions, selectedMonth]);

  // 3. Category budget calculations
  const categoryBudgetCalculations = useMemo(() => {
    const categoryBudgets = monthBudgets.filter((b) => b.category_id !== null);
    return categoryBudgets.map((b) => calculateBudgetDetails(b, transactions));
  }, [monthBudgets, transactions]);

  const handleCreateBudget = () => {
    router.push({
      pathname: '/add-budget',
      params: { month: selectedMonth },
    } as any);
  };

  const handleEditBudget = (budget: Budget) => {
    router.push({
      pathname: '/budget/[id]',
      params: { id: budget.id },
    } as any);
  };

  const handleDeleteBudgetClick = (budget: Budget) => {
    setBudgetToDelete(budget);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Delete Failed', msg || 'Could not delete budget. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasAnyBudgetsInMonth = monthBudgets.length > 0;
  const monthName = formatMonthDisplay(selectedMonth);

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
            refreshing={isRefreshing || isLoadingBudgets}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* 1. Header Bar matching Kwarta Design System */}
        <View className="flex-row items-center justify-between mb-4 pt-1">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                BUDGET & LIMITS
              </Text>
              <Text className="text-slate-600 text-xs mx-1.5">•</Text>
              <Text className="text-emerald-400 text-xs font-medium">
                {monthBudgets.length} {monthBudgets.length === 1 ? 'Budget' : 'Budgets'}
              </Text>
            </View>

            <Text className="text-white text-[26px] font-extrabold tracking-tight mt-0.5">
              My Budgets
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Stay on track with your spending.
            </Text>
          </View>

          <Button
            title="Add"
            size="sm"
            onPress={handleCreateBudget}
            leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
          />
        </View>

        {/* 2. Month Selector Navigation */}
        <BudgetMonthSelector
          selectedMonth={selectedMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onResetToCurrentMonth={resetToCurrentMonth}
          className="mb-4"
        />

        {/* 3. Error Banner if Database Query Failed */}
        {budgetError ? (
          <View className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl mb-4 flex-row items-center justify-between">
            <Text className="text-red-300 text-xs flex-1 mr-3">
              {budgetError}
            </Text>
            <Button
              title="Retry"
              size="sm"
              variant="outline"
              onPress={refreshBudgets}
              leftIcon={<RefreshCw size={13} color="#10B981" />}
            />
          </View>
        ) : null}

        {/* 4. Loading State */}
        {isLoadingBudgets && budgets.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 text-xs mt-3">
              Loading budgets...
            </Text>
          </View>
        ) : !hasAnyBudgetsInMonth ? (
          /* 5. Empty State for selected month */
          <BudgetEmptyState
            isMonthSpecific={true}
            monthName={monthName}
            onCreateBudget={handleCreateBudget}
            className="mt-2"
          />
        ) : (
          /* 6. Active Budgets Content */
          <View>
            {/* Overall Monthly Budget Card */}
            <BudgetOverviewCard
              overview={monthlyOverview}
              month={selectedMonth}
              onAddOverallBudget={() =>
                router.push({
                  pathname: '/add-budget',
                  params: { type: 'overall', month: selectedMonth },
                } as any)
              }
              className="mb-5"
            />

            {/* Category Budgets Section */}
            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-3 px-0.5">
                <View className="flex-row items-center">
                  <Tag size={15} color="#10B981" className="mr-2" />
                  <Text className="text-white text-base font-bold">
                    Category Budgets
                  </Text>
                </View>

                <View className="bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                  <Text className="text-slate-300 text-[11px] font-semibold">
                    {categoryBudgetCalculations.length}{' '}
                    {categoryBudgetCalculations.length === 1 ? 'category' : 'categories'}
                  </Text>
                </View>
              </View>

              {categoryBudgetCalculations.length === 0 ? (
                <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 items-center justify-center py-6 mb-3">
                  <Text className="text-slate-300 text-sm font-semibold mb-1">
                    No category budgets for {monthName}
                  </Text>
                  <Text className="text-slate-500 text-xs text-center max-w-[260px] mb-3">
                    Set limits on specific categories like Groceries or Transportation to track your spending.
                  </Text>
                  <Button
                    title="Add Category Budget"
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/add-budget',
                        params: { type: 'category', month: selectedMonth },
                      } as any)
                    }
                    leftIcon={<Plus size={14} color="#10B981" />}
                  />
                </View>
              ) : (
                categoryBudgetCalculations.map((calc) => (
                  <BudgetCategoryCard
                    key={calc.budget.id}
                    calculation={calc}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudgetClick}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteBudgetConfirmModal
        visible={Boolean(budgetToDelete)}
        budgetName={
          budgetToDelete?.category?.name
            ? `${budgetToDelete.category.name} budget`
            : 'overall monthly budget'
        }
        onCancel={() => setBudgetToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}
