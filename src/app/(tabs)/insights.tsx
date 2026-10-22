import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

export default function InsightsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center py-8">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center border border-slate-700/80 mb-4">
          <PieChart size={32} color="#10B981" />
        </View>

        <Text className="text-white text-xl font-bold text-center">
          Financial Insights & Analytics
        </Text>
        <Text className="text-slate-400 text-sm text-center mt-2 px-6 leading-5">
          Visualize spending breakdowns, category distributions, and monthly cash flow trends.
        </Text>
      </View>

      <Card className="mb-6">
        <View className="flex-row items-center mb-3">
          <BarChart3 size={18} color="#10B981" />
          <Text className="text-white font-semibold text-base ml-2">
            Step 1 Placeholder
          </Text>
        </View>
        <Text className="text-slate-400 text-xs leading-5">
          Analytics, budget progress bars, and SVG chart visualizations will be constructed on top of the local SQLite database in upcoming feature steps.
        </Text>
      </Card>
    </ScrollView>
  );
}
