import React from 'react';
import { View, Text } from 'react-native';

interface SavingsProgressBarProps {
  progressPercentage: number; // Raw percentage (can exceed 100)
  cappedPercentage: number; // 0 to 100 for visual width
  color?: string; // Goal color or default emerald
  height?: number;
  showText?: boolean;
  className?: string;
}

export function SavingsProgressBar({
  progressPercentage,
  cappedPercentage,
  color = '#10B981',
  height = 8,
  showText = false,
  className = '',
}: SavingsProgressBarProps) {
  const isComplete = progressPercentage >= 100;
  const barColor = isComplete ? '#10B981' : color;

  return (
    <View className={className}>
      <View
        style={{
          height,
          backgroundColor: 'rgba(51, 65, 85, 0.5)',
          borderRadius: height / 2,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, cappedPercentage))}%`,
            backgroundColor: barColor,
            borderRadius: height / 2,
          }}
        />
      </View>

      {showText && (
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-slate-400 text-xs font-medium">Progress</Text>
          <Text
            style={{ color: barColor }}
            className="text-xs font-bold tracking-tight"
          >
            {`${progressPercentage.toFixed(1)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}

export default SavingsProgressBar;
