import React from 'react';
import { View, Text } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

interface InsightsHeaderProps {
  rangeLabel: string;
}

export function InsightsHeader({ rangeLabel }: InsightsHeaderProps) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Financial Analytics
          </Text>
          <Text className="text-white text-2xl font-bold tracking-tight mt-0.5">
            Insights
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Understand your money better.
          </Text>
        </View>

        <View className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
          <BarChart3 size={20} color="#10B981" />
        </View>
      </View>

      {/* Active Range pill */}
      <View className="mt-2.5 self-start bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
        <Text className="text-slate-300 text-[11px] font-medium">
          {rangeLabel}
        </Text>
      </View>
    </View>
  );
}
