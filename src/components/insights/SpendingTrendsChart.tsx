import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { TrendingDown } from 'lucide-react-native';
import { SpendingTrendPoint } from '@/types/analytics';
import { formatCentavosToPhp, formatCompactCentavosToPhp } from '@/utils/currency';

interface SpendingTrendsChartProps {
  points: SpendingTrendPoint[];
}

export function SpendingTrendsChart({ points }: SpendingTrendsChartProps) {
  const windowWidth = Dimensions.get('window').width;
  const [containerWidth, setContainerWidth] = useState(
    Math.max(280, windowWidth - 40)
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    points.length > 0 ? points.length - 1 : null
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

  const maxVal = points.reduce((acc, p) => Math.max(acc, p.amountCentavos), 0);
  const safeMax = maxVal > 0 ? maxVal : 100000;

  const selectedPoint =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < points.length
      ? points[selectedIndex]
      : null;

  const pointCount = Math.max(1, points.length);
  const stepX = pointCount > 1 ? innerWidth / (pointCount - 1) : innerWidth / 2;

  // Calculate coordinates for points
  const coords = points.map((p, i) => {
    const x =
      pointCount > 1
        ? paddingLeft + i * stepX
        : paddingLeft + innerWidth / 2;
    const y =
      paddingTop +
      innerHeight -
      (p.amountCentavos / safeMax) * innerHeight;
    return { x, y, point: p, index: i };
  });

  // Construct SVG paths
  let linePathD = '';
  let areaPathD = '';

  if (coords.length > 0) {
    linePathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      linePathD += ` L ${coords[i].x} ${coords[i].y}`;
    }

    const baselineY = paddingTop + innerHeight;
    areaPathD = `${linePathD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;
  }

  // Y-axis grid ticks
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
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3 pb-2.5 border-b border-slate-700/50">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/10 items-center justify-center mr-2">
            <TrendingDown size={15} color="#10B981" />
          </View>
          <Text className="text-white font-bold text-base">
            Spending Trends
          </Text>
        </View>

        <Text className="text-slate-400 text-xs font-semibold">
          Expenses Over Time
        </Text>
      </View>

      {/* Selected Point Tooltip Callout */}
      {selectedPoint && (
        <View className="bg-slate-800/90 rounded-xl p-2.5 mb-2 border border-slate-700/80 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              {selectedPoint.fullDate}
            </Text>
            <Text className="text-white text-xs font-bold mt-0.5">
              Expenses: {formatCentavosToPhp(selectedPoint.amountCentavos)}
            </Text>
          </View>

          <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
            <Text className="text-emerald-400 text-[10px] font-bold">
              {selectedPoint.label}
            </Text>
          </View>
        </View>
      )}

      {/* Chart container with relative positioning */}
      <View style={{ width: containerWidth, height: chartHeight, position: 'relative' }}>
        <Svg width={containerWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tick) => {
            const y =
              paddingTop +
              innerHeight -
              (tick.value / safeMax) * innerHeight;
            return (
              <React.Fragment key={`grid-line-${tick.value}`}>
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

          {/* Area Fill */}
          {areaPathD ? (
            <Path d={areaPathD} fill="url(#spendingGradient)" />
          ) : null}

          {/* Stroke Line */}
          {linePathD ? (
            <Path
              d={linePathD}
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}

          {/* Data points & X axis labels */}
          {coords.map((c) => {
            const isSelected = selectedIndex === c.index;
            return (
              <React.Fragment key={`point-${c.point.key}`}>
                {/* Vertical guideline on selection */}
                {isSelected && (
                  <Line
                    x1={c.x}
                    y1={paddingTop}
                    x2={c.x}
                    y2={paddingTop + innerHeight}
                    stroke="#10B981"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity={0.6}
                  />
                )}

                {/* Point Dot */}
                <Circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? 5 : 3.5}
                  fill={isSelected ? '#10B981' : '#0B1220'}
                  stroke="#10B981"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* X Axis Label */}
                <SvgText
                  x={c.x}
                  y={chartHeight - 8}
                  fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                  fontSize="9"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {c.point.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Tap zones overlay perfectly aligned with SVG */}
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
          {coords.map((c) => (
            <TouchableOpacity
              key={`touch-point-${c.point.key}`}
              onPress={() => setSelectedIndex(c.index)}
              activeOpacity={0.6}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      </View>

      <Text className="text-slate-400 text-[10px] text-center mt-2">
        Tap any point along the curve to inspect spending.
      </Text>
    </View>
  );
}
