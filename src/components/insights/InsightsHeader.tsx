import React from 'react';
import { View, Text } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

export function InsightsHeader() {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Financial Insights
          </Text>
          <Text className="text-white text-2xl font-bold tracking-tight mt-0.5">
            Analytics
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Understand your money better.
          </Text>
        </View>

        <View className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
          <BarChart3 size={20} color="#10B981" />
        </View>
      </View>
    </View>
  );
}
