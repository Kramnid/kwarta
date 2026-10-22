import React from 'react';
import { View, Text } from 'react-native';
import {
  ArrowUp,
  ArrowDown,
  Scale,
  Percent,
  CalendarDays,
} from 'lucide-react-native';
import { FinancialOverview, DailySpendingCalculation } from '@/types/analytics';
import { formatCentavosToPhp } from '@/utils/currency';

interface FinancialOverviewCardsProps {
  overview: FinancialOverview;
  dailySpending: DailySpendingCalculation;
}

export function FinancialOverviewCards({
  overview,
  dailySpending,
}: FinancialOverviewCardsProps) {
  const isNetPositive = overview.netCashFlow > 0;
  const isNetNegative = overview.netCashFlow < 0;

  const netColor = isNetPositive
    ? '#10B981'
    : isNetNegative
    ? '#F87171'
    : '#94A3B8';

  const savingsRateDisplay =
    overview.savingsRate !== null
      ? `${overview.savingsRate > 0 ? '+' : ''}${overview.savingsRate.toFixed(1)}%`
      : 'N/A';

  const savingsRateColor =
    overview.savingsRate !== null
      ? overview.savingsRate > 0
        ? '#10B981'
        : overview.savingsRate < 0
        ? '#F87171'
        : '#94A3B8'
      : '#94A3B8';

  return (
    <View className="mb-6">
      {/* 2x2 Grid of Financial Metrics */}
      <View className="flex-row gap-3 mb-3">
        {/* Total Income */}
        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Income
            </Text>
            <View className="w-6 h-6 rounded-full bg-emerald-500/10 items-center justify-center">
              <ArrowUp size={13} color="#10B981" strokeWidth={2.5} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            className="text-emerald-400 text-lg font-extrabold"
          >
            {formatCentavosToPhp(overview.totalIncome)}
          </Text>
          <Text className="text-slate-400 text-[11px] mt-1">
            Period earnings
          </Text>
        </View>

        {/* Total Expenses */}
        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Expenses
            </Text>
            <View className="w-6 h-6 rounded-full bg-rose-500/10 items-center justify-center">
              <ArrowDown size={13} color="#F87171" strokeWidth={2.5} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            className="text-rose-400 text-lg font-extrabold"
          >
            {formatCentavosToPhp(overview.totalExpenses)}
          </Text>
          <Text className="text-slate-400 text-[11px] mt-1">
            Period outflows
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3 mb-3">
        {/* Net Cash Flow */}
        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Net Cash Flow
            </Text>
            <View className="w-6 h-6 rounded-full bg-slate-800 items-center justify-center">
              <Scale size={13} color={netColor} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{ color: netColor }}
            className="text-lg font-extrabold"
          >
            {isNetPositive ? '+' : ''}
            {formatCentavosToPhp(overview.netCashFlow)}
          </Text>
          <Text className="text-slate-400 text-[11px] mt-1">
            Income minus expenses
          </Text>
        </View>

        {/* Savings Rate */}
        <View className="flex-1 bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Savings Rate
            </Text>
            <View className="w-6 h-6 rounded-full bg-slate-800 items-center justify-center">
              <Percent size={13} color={savingsRateColor} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{ color: savingsRateColor }}
            className="text-lg font-extrabold"
          >
            {savingsRateDisplay}
          </Text>
          <Text className="text-slate-400 text-[11px] mt-1">
            {overview.hasIncome ? 'Of income preserved' : 'No income recorded'}
          </Text>
        </View>
      </View>

      {/* Average Daily Spending Card */}
      <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center mr-3">
            <CalendarDays size={18} color="#60A5FA" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Average Daily Spending
            </Text>
            <Text className="text-slate-400 text-[11px] mt-0.5">
              {dailySpending.isFutureOnly
                ? 'Future period'
                : `Over ${dailySpending.elapsedDays} ${
                    dailySpending.elapsedDays === 1 ? 'calendar day' : 'calendar days'
                  }`}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white text-base font-extrabold">
            {dailySpending.isFutureOnly
              ? 'N/A'
              : `${formatCentavosToPhp(dailySpending.averageDailyCentavos)} / day`}
          </Text>
        </View>
      </View>
    </View>
  );
}
