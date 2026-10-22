import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { PieChart, Sparkles } from 'lucide-react-native';
import { CategorySpending } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';

interface SpendingBreakdownChartProps {
  categories: CategorySpending[];
  totalExpenses: number;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

function computeCategorySlices(
  categories: CategorySpending[],
  circumference: number,
  selectedCategoryId: string | null
) {
  let accumulatedPct = 0;
  return categories.map((cat) => {
    const pct = cat.percentage;
    const strokeDash = (pct / 100) * circumference;
    const strokeOffset = circumference - (accumulatedPct / 100) * circumference;
    accumulatedPct += pct;

    return {
      ...cat,
      strokeDash,
      strokeOffset,
      isSelected: selectedCategoryId === cat.categoryId,
    };
  });
}

export function SpendingBreakdownChart({
  categories,
  totalExpenses,
  selectedCategoryId,
  onSelectCategory,
}: SpendingBreakdownChartProps) {
  const chartSize = 210;
  const strokeWidth = 24;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = chartSize / 2;

  // Selected category info
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.categoryId === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Slices computed safely before any return
  const slices = useMemo(() => {
    return computeCategorySlices(categories, circumference, selectedCategoryId);
  }, [categories, circumference, selectedCategoryId]);

  if (totalExpenses <= 0 || categories.length === 0) {
    return (
      <View className="bg-[#151F30] rounded-2xl p-5 border border-slate-700/60 mb-6 items-center shadow-sm">
        <View className="flex-row items-center self-start mb-4 pb-2.5 border-b border-slate-700/50 w-full">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
            <PieChart size={15} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-base">
            Spending by Category
          </Text>
        </View>

        <View className="py-8 items-center">
          <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center mb-3">
            <Sparkles size={20} color="#94A3B8" />
          </View>
          <Text className="text-white font-semibold text-sm">
            No expenses recorded
          </Text>
          <Text className="text-slate-400 text-xs text-center mt-1 max-w-xs">
            Zero expense transactions found for this period.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 mb-6 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 pb-2.5 border-b border-slate-700/50">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
            <PieChart size={15} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-base">
            Spending Breakdown
          </Text>
        </View>

        {selectedCategoryId && (
          <TouchableOpacity
            onPress={() => onSelectCategory(null)}
            className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60"
          >
            <Text className="text-slate-300 text-[11px] font-semibold">
              Show All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Donut Chart with Center Text */}
      <View className="items-center justify-center my-1">
        <View style={{ width: chartSize, height: chartSize }} className="relative items-center justify-center">
          <Svg width={chartSize} height={chartSize}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {/* Background track circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#1E293B"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Category Segment Arcs */}
              {slices.map((slice) => {
                const color = slice.categoryColor || '#10B981';
                return (
                  <Circle
                    key={`slice-${slice.categoryId}`}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={slice.isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${slice.strokeDash} ${circumference}`}
                    strokeDashoffset={slice.strokeOffset}
                    strokeLinecap="butt"
                    fill="none"
                    opacity={
                      selectedCategoryId
                        ? slice.isSelected
                          ? 1
                          : 0.35
                        : 0.95
                    }
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center Callout */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: strokeWidth + 4,
            }}
          >
            {activeCategory ? (
              <>
                <Text
                  numberOfLines={1}
                  className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider text-center"
                >
                  {activeCategory.categoryName}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  className="text-white font-extrabold text-base mt-0.5 text-center"
                >
                  {formatCentavosToPhp(activeCategory.amount)}
                </Text>
                <Text
                  style={{ color: activeCategory.categoryColor || '#10B981' }}
                  className="text-xs font-bold mt-0.5"
                >
                  {activeCategory.percentage.toFixed(1)}%
                </Text>
              </>
            ) : (
              <>
                <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider text-center">
                  Total Expenses
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  className="text-white font-extrabold text-base mt-0.5 text-center"
                >
                  {formatCentavosToPhp(totalExpenses)}
                </Text>
                <Text className="text-slate-400 text-[10px] mt-0.5">
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <Text className="text-slate-400 text-[10px] text-center my-2">
        Tap any category below to isolate its share.
      </Text>

      {/* Integrated Sorted Category List */}
      <View className="mt-2 pt-3 border-t border-slate-700/50">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">
            Ranked Categories
          </Text>
          <Text className="text-slate-400 text-[11px]">
            Highest to Lowest
          </Text>
        </View>

        <View className="gap-2.5">
          {categories.map((item) => {
            const isSelected = selectedCategoryId === item.categoryId;
            const color = item.categoryColor || '#10B981';

            return (
              <TouchableOpacity
                key={`cat-item-${item.categoryId}`}
                onPress={() =>
                  onSelectCategory(isSelected ? null : item.categoryId)
                }
                activeOpacity={0.7}
                style={{
                  backgroundColor: isSelected ? '#1E293B' : 'transparent',
                }}
                className="p-2 -mx-1 rounded-xl transition-all"
              >
                {/* Row: Icon, Name, Amount, Percentage */}
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      style={{
                        backgroundColor: `${color}20`,
                        borderColor: `${color}40`,
                      }}
                      className="w-7 h-7 rounded-lg items-center justify-center border mr-2.5"
                    >
                      <CategoryIcon
                        name={item.categoryIcon}
                        color={color}
                        size={14}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      className="text-slate-200 text-xs font-semibold flex-1"
                    >
                      {item.categoryName}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-white text-xs font-bold mr-2">
                      {formatCentavosToPhp(item.amount)}
                    </Text>
                    <Text
                      style={{ color: isSelected ? color : '#94A3B8' }}
                      className="text-xs font-bold w-12 text-right"
                    >
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                      minWidth: 6,
                      backgroundColor: color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
