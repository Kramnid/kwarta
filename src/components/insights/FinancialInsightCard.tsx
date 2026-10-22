import React from 'react';
import { View, Text } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertTriangle,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Minus,
} from 'lucide-react-native';
import { FinancialInsight } from '@/types/analytics';

interface FinancialInsightCardProps {
  insight: FinancialInsight;
}

function InsightIcon({
  icon,
  color,
  size = 16,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  switch (icon) {
    case 'trending-up':
      return <TrendingUp size={size} color={color} />;
    case 'trending-down':
      return <TrendingDown size={size} color={color} />;
    case 'pie-chart':
      return <PieChart size={size} color={color} />;
    case 'alert-triangle':
      return <AlertTriangle size={size} color={color} />;
    case 'alert-circle':
      return <AlertCircle size={size} color={color} />;
    case 'wallet':
      return <Wallet size={size} color={color} />;
    case 'check-circle-2':
      return <CheckCircle2 size={size} color={color} />;
    case 'credit-card':
      return <CreditCard size={size} color={color} />;
    case 'minus':
      return <Minus size={size} color={color} />;
    case 'sparkles':
    default:
      return <Sparkles size={size} color={color} />;
  }
}

export function FinancialInsightCard({ insight }: FinancialInsightCardProps) {
  const color = insight.color || '#10B981';

  return (
    <View
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      className="bg-[#151F30] rounded-xl p-3.5 border border-slate-700/60 shadow-sm mb-3 flex-row items-start"
    >
      <View
        style={{ backgroundColor: `${color}15`, borderColor: `${color}35` }}
        className="w-8 h-8 rounded-lg items-center justify-center border mr-3 mt-0.5"
      >
        <InsightIcon icon={insight.icon} color={color} size={16} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-xs font-bold flex-1 mr-2">
            {insight.title}
          </Text>

          {insight.badge && (
            <View
              style={{ backgroundColor: `${color}20` }}
              className="px-2 py-0.5 rounded-full"
            >
              <Text
                style={{ color }}
                className="text-[10px] font-extrabold"
              >
                {insight.badge}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-slate-300 text-xs leading-4">
          {insight.description}
        </Text>
      </View>
    </View>
  );
}
