import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Plus, Pencil } from 'lucide-react-native';
import { MonthlyBudgetOverview } from '@/types/budget';
import { formatCentavosToPhp, splitCentavosToPhp } from '@/utils/currency';
import { formatMonthDisplay } from '@/utils/budget';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

interface BudgetOverviewCardProps {
  overview: MonthlyBudgetOverview;
  month: string;
  onAddOverallBudget?: () => void;
  className?: string;
}

export function BudgetOverviewCard({
  overview,
  month,
  onAddOverallBudget,
  className = '',
}: BudgetOverviewCardProps) {
  const router = useRouter();
  const monthDisplay = formatMonthDisplay(month);

  // 1. Case: Overall Monthly Budget is configured
  if (overview.hasOverallBudget && overview.overallBudget) {
    const budget = overview.overallBudget;
    const splitLimit = splitCentavosToPhp(overview.totalBudgetLimitCentavos);
    const formattedSpent = formatCentavosToPhp(overview.totalSpentCentavos);
    const isExceeded = overview.isExceeded;
    const remainingText = isExceeded
      ? `Exceeded by ${formatCentavosToPhp(Math.abs(overview.remainingCentavos))}`
      : `${formatCentavosToPhp(overview.remainingCentavos)} remaining`;

    const handleEditOverall = () => {
      router.push({
        pathname: '/budget/[id]',
        params: { id: budget.id },
      } as any);
    };

    return (
      <View
        className={`bg-[#151F30] rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden ${className}`}
      >
        {/* Top 3px Accent Strip */}
        <View className="h-[3px] bg-emerald-500 w-full" />

        <View style={{ padding: 20 }}>
          {/* Eyebrow & Status Badge */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <ShieldCheck size={14} color="#10B981" className="mr-1.5" />
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Monthly Budget
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <BudgetStatusBadge status={overview.status} />
              <Pressable
                onPress={handleEditOverall}
                hitSlop={8}
                className="w-7 h-7 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
                accessibilityLabel="Edit overall budget"
              >
                <Pencil size={12} color="#94A3B8" />
              </Pressable>
            </View>
          </View>

          {/* Large Budget Limit Display */}
          <View className="mb-4">
            <Text className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-0.5">
              Spending Limit
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-emerald-400 text-2xl font-black mr-1.5">
                {splitLimit.symbol}
              </Text>
              <Text className="text-white text-3xl font-black tracking-tight">
                {splitLimit.formattedAmount}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <BudgetProgressBar
            percentage={overview.percentage}
            status={overview.status}
            height={9}
            className="mb-3.5"
          />

          {/* Bottom Breakdown: Spent vs Remaining */}
          <View className="flex-row items-center justify-between pt-1 border-t border-slate-800/80">
            <View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Spent
              </Text>
              <Text className="text-slate-200 text-xs font-bold mt-0.5">
                {formattedSpent}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Usage
              </Text>
              <Text
                className={`text-xs font-bold mt-0.5 ${
                  isExceeded ? 'text-red-400' : 'text-slate-200'
                }`}
              >
                {overview.percentage.toFixed(1)}%
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Status
              </Text>
              <Text
                className={`text-xs font-bold mt-0.5 ${
                  isExceeded ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {remainingText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 2. Case: No Overall Budget Configured
  const formattedSpent = formatCentavosToPhp(overview.totalSpentCentavos);

  return (
    <View
      className={`bg-[#151F30] rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden ${className}`}
    >
      {/* Top 3px Accent Strip */}
      <View className="h-[3px] bg-slate-700 w-full" />

      <View style={{ padding: 20 }}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <ShieldCheck size={14} color="#94A3B8" className="mr-1.5" />
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Monthly Budget Overview
            </Text>
          </View>

          <View className="bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
            <Text className="text-slate-400 text-[10px] font-semibold">
              Not Set
            </Text>
          </View>
        </View>

        <Text className="text-slate-400 text-xs leading-5 mb-4">
          {"You haven't set an overall monthly spending limit for "}
          {monthDisplay}.
          {overview.categoryBudgetsCount > 0
            ? ` You have ${overview.categoryBudgetsCount} category ${
                overview.categoryBudgetsCount === 1 ? 'budget' : 'budgets'
              } configured below.`
            : ' Setting a budget helps you control expenses.'}
        </Text>

        <View className="flex-row items-center justify-between bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 mb-3.5">
          <View>
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              {monthDisplay} Spending
            </Text>
            <Text className="text-white text-base font-extrabold mt-0.5">
              {formattedSpent}
            </Text>
          </View>

          {onAddOverallBudget && (
            <Pressable
              onPress={onAddOverallBudget}
              className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 rounded-xl active:bg-emerald-500/25"
              accessibilityRole="button"
              accessibilityLabel="Set overall budget"
            >
              <Plus size={14} color="#10B981" className="mr-1.5" />
              <Text className="text-emerald-400 text-xs font-bold">
                Set Overall Limit
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
