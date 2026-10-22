import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { ArrowLeftRight } from 'lucide-react-native';
import { IncomeExpenseBucket } from '@/types/analytics';
import { formatCentavosToPhp, formatCompactCentavosToPhp } from '@/utils/currency';

interface IncomeExpenseChartProps {
  buckets: IncomeExpenseBucket[];
}

export function IncomeExpenseChart({ buckets }: IncomeExpenseChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const [containerWidth, setContainerWidth] = useState(
    Math.max(280, windowWidth - 40)
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    buckets.length > 0 ? buckets.length - 1 : null
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 50) {
      setContainerWidth(width);
    }
  };

  const chartHeight = 180;
  const paddingLeft = 46;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;

  const innerWidth = containerWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Find max value across income and expense centavos
  const maxVal = buckets.reduce((acc, b) => {
    return Math.max(acc, b.incomeCentavos, b.expenseCentavos);
  }, 0);

  const safeMax = maxVal > 0 ? maxVal : 100000; // default ₱1,000 for empty chart

  const selectedBucket =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < buckets.length
      ? buckets[selectedIndex]
      : null;

  const bucketCount = Math.max(1, buckets.length);
  const slotWidth = innerWidth / bucketCount;
  const barWidth = Math.max(4, Math.min(16, (slotWidth - 6) / 2));
  const barGap = 2;

  // Grid tick values (3 lines: 0, 50%, 100%)
  const yTicks = [
    { value: safeMax, label: formatCompactCentavosToPhp(safeMax) },
    { value: Math.round(safeMax / 2), label: formatCompactCentavosToPhp(Math.round(safeMax / 2)) },
    { value: 0, label: '₱0' },
  ];

  return (
    <View
      onLayout={handleLayout}
      className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 mb-6 shadow-sm"
    >
      {/* Chart Section Header */}
      <View className="flex-row items-center justify-between mb-3 pb-2.5 border-b border-slate-700/50">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
            <ArrowLeftRight size={15} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-base">
            Income vs. Expenses
          </Text>
        </View>

        {/* Legend */}
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5" />
            <Text className="text-slate-300 text-[11px] font-medium">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-sm bg-rose-400 mr-1.5" />
            <Text className="text-slate-300 text-[11px] font-medium">Expenses</Text>
          </View>
        </View>
      </View>

      {/* Selected Period Callout / Tooltip */}
      {selectedBucket && (
        <View className="bg-slate-800/90 rounded-xl p-2.5 mb-2 border border-slate-700/80 flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              {selectedBucket.fullPeriodLabel}
            </Text>
            <View className="flex-row items-center gap-3 mt-0.5">
              <Text className="text-emerald-400 text-xs font-bold">
                In: {formatCentavosToPhp(selectedBucket.incomeCentavos)}
              </Text>
              <Text className="text-rose-400 text-xs font-bold">
                Out: {formatCentavosToPhp(selectedBucket.expenseCentavos)}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-slate-400 text-[10px] uppercase">Net</Text>
            <Text
              style={{
                color:
                  selectedBucket.incomeCentavos >= selectedBucket.expenseCentavos
                    ? '#10B981'
                    : '#F87171',
              }}
              className="text-xs font-extrabold"
            >
              {selectedBucket.incomeCentavos >= selectedBucket.expenseCentavos
                ? '+'
                : ''}
              {formatCentavosToPhp(
                selectedBucket.incomeCentavos - selectedBucket.expenseCentavos
              )}
            </Text>
          </View>
        </View>
      )}

      {/* Chart container with relative positioning */}
      <View style={{ width: containerWidth, height: chartHeight, position: 'relative' }}>
        <Svg width={containerWidth} height={chartHeight}>
          {/* Horizontal Grid lines */}
          {yTicks.map((tick) => {
            const y =
              paddingTop +
              innerHeight -
              (tick.value / safeMax) * innerHeight;
            return (
              <React.Fragment key={`grid-${tick.value}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#94A3B8"
                  fontSize="9"
                  fontWeight="500"
                  textAnchor="end"
                >
                  {tick.label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Grouped Bars */}
          {buckets.map((bucket, index) => {
            const isSelected = selectedIndex === index;
            const slotCenterX =
              paddingLeft + index * slotWidth + slotWidth / 2;

            const incomeBarHeight = Math.max(
              0,
              (bucket.incomeCentavos / safeMax) * innerHeight
            );
            const expenseBarHeight = Math.max(
              0,
              (bucket.expenseCentavos / safeMax) * innerHeight
            );

            const incomeX = slotCenterX - barWidth - barGap / 2;
            const expenseX = slotCenterX + barGap / 2;

            const incomeY = paddingTop + innerHeight - incomeBarHeight;
            const expenseY = paddingTop + innerHeight - expenseBarHeight;

            return (
              <React.Fragment key={`bucket-${bucket.key}`}>
                {/* Highlight background column on selection */}
                {isSelected && (
                  <Rect
                    x={slotCenterX - slotWidth / 2 + 1}
                    y={paddingTop}
                    width={slotWidth - 2}
                    height={innerHeight}
                    fill="#1E293B"
                    rx="4"
                    opacity={0.6}
                  />
                )}

                {/* Income Bar (Emerald) */}
                <Rect
                  x={incomeX}
                  y={incomeBarHeight > 0 ? incomeY : paddingTop + innerHeight - 1}
                  width={barWidth}
                  height={Math.max(1, incomeBarHeight)}
                  fill="#10B981"
                  rx={Math.min(3, barWidth / 2)}
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* Expense Bar (Rose Red) */}
                <Rect
                  x={expenseX}
                  y={expenseBarHeight > 0 ? expenseY : paddingTop + innerHeight - 1}
                  width={barWidth}
                  height={Math.max(1, expenseBarHeight)}
                  fill="#F87171"
                  rx={Math.min(3, barWidth / 2)}
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* X Axis Label */}
                <SvgText
                  x={slotCenterX}
                  y={chartHeight - 8}
                  fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                  fontSize="9"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {bucket.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Tap interaction zone perfectly aligned over SVG */}
        <View
          style={{
            position: 'absolute',
            left: paddingLeft,
            top: paddingTop,
            width: innerWidth,
            height: innerHeight,
            flexDirection: 'row',
          }}
        >
          {buckets.map((b, i) => (
            <TouchableOpacity
              key={`touch-${b.key}`}
              onPress={() => setSelectedIndex(i)}
              activeOpacity={0.6}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      </View>

      <Text className="text-slate-400 text-[10px] text-center mt-2">
        Tap any period column to view exact breakdown.
      </Text>
    </View>
  );
}
