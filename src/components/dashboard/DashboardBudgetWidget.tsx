import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { WalletCards, Plus, ArrowRight } from 'lucide-react-native';
import { useAppStore } from '@/store';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  getCurrentMonthString,
  calculateMonthlyOverview,
} from '@/utils/budget';
import { formatCentavosToPhp } from '@/utils/currency';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BudgetProgressBar } from '@/components/budgets/BudgetProgressBar';
import { BudgetStatusBadge } from '@/components/budgets/BudgetStatusBadge';

interface DashboardBudgetWidgetProps {
  month?: string;
  className?: string;
}

export function DashboardBudgetWidget({
  month,
  className = '',
}: DashboardBudgetWidgetProps) {
  const router = useRouter();
  const currentMonth = month || getCurrentMonthString();
  const { transactions } = useAppStore();
  const { budgets } = useBudgetStore();

  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === currentMonth);
  }, [budgets, currentMonth]);

  const overview = useMemo(() => {
    return calculateMonthlyOverview(monthBudgets, transactions, currentMonth);
  }, [monthBudgets, transactions, currentMonth]);

  const handleSeeBudgets = () => {
    router.push('/(tabs)/budgets');
  };

  const handleAddBudget = () => {
    router.push({
      pathname: '/add-budget',
      params: { month: currentMonth },
    } as any);
  };

  return (
    <View className={`mb-5 ${className}`}>
      <SectionHeader
        title="Monthly Budget"
        actionText="View Budgets →"
        onActionPress={handleSeeBudgets}
      />

      <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
        {overview.hasOverallBudget ? (
          /* Case 1: Overall Budget Configured */
          <Pressable
            onPress={handleSeeBudgets}
            className="active:opacity-80 transition-opacity"
            accessibilityRole="button"
            accessibilityLabel={`Monthly budget: ${formatCentavosToPhp(
              overview.totalSpentCentavos
            )} of ${formatCentavosToPhp(overview.totalBudgetLimitCentavos)} used`}
          >
            {/* Top Row: Spending / Limit + Status Badge */}
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-baseline">
                <Text className="text-white text-base font-extrabold tracking-tight">
                  {formatCentavosToPhp(overview.totalSpentCentavos)}
                </Text>
                <Text className="text-slate-400 text-xs font-semibold ml-1.5">
                  / {formatCentavosToPhp(overview.totalBudgetLimitCentavos)}
                </Text>
              </View>

              <BudgetStatusBadge status={overview.status} />
            </View>

            {/* Progress Bar */}
            <BudgetProgressBar
              percentage={overview.percentage}
              status={overview.status}
              height={7}
              className="mb-2.5"
            />

            {/* Bottom Row: Percentage used + Remaining/Exceeded */}
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-400 text-xs font-semibold">
                {overview.percentage.toFixed(1)}% used
              </Text>

              <Text
                className={`text-xs font-bold ${
                  overview.isExceeded ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {overview.isExceeded
                  ? `Exceeded by ${formatCentavosToPhp(
                      Math.abs(overview.remainingCentavos)
                    )}`
                  : `${formatCentavosToPhp(overview.remainingCentavos)} remaining`}
              </Text>
            </View>
          </Pressable>
        ) : overview.categoryBudgetsCount > 0 ? (
          /* Case 2: Only Category Budgets Configured */
          <Pressable
            onPress={handleSeeBudgets}
            className="active:opacity-80 transition-opacity"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 items-center justify-center mr-2.5">
                  <WalletCards size={16} color="#10B981" />
                </View>
                <View>
                  <Text className="text-white text-sm font-bold">
                    {overview.categoryBudgetsCount} Category{' '}
                    {overview.categoryBudgetsCount === 1 ? 'Budget' : 'Budgets'}
                  </Text>
                  <Text className="text-slate-400 text-xs font-medium">
                    {formatCentavosToPhp(overview.totalSpentCentavos)} total spent
                  </Text>
                </View>
              </View>

              <ArrowRight size={16} color="#94A3B8" />
            </View>

            <Text className="text-slate-500 text-[11px] leading-4 mt-1">
              No overall monthly spending limit set. Tap to view category progress or set an overall limit.
            </Text>
          </Pressable>
        ) : (
          /* Case 3: No Budgets At All For This Month */
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center mr-3">
                <WalletCards size={18} color="#94A3B8" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-bold">
                  No budget set
                </Text>
                <Text className="text-slate-400 text-xs">
                  Set a limit to stay on track.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleAddBudget}
              className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl active:bg-emerald-500/25"
              accessibilityRole="button"
              accessibilityLabel="Create budget"
            >
              <Plus size={14} color="#10B981" className="mr-1" />
              <Text className="text-emerald-400 text-xs font-bold">
                Set Budget
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
