import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { splitCentavosToPhp } from '@/utils/currency';
import { useAppStore } from '@/store';

interface BalanceCardProps {
  balanceCentavos: number;
  className?: string;
}

export function BalanceCard({
  balanceCentavos,
  className = '',
}: BalanceCardProps) {
  const { isBalanceHidden, toggleBalanceHidden } = useAppStore();
  const isPositive = balanceCentavos >= 0;
  const { symbol, formattedAmount } = splitCentavosToPhp(balanceCentavos);

  const handleTogglePrivacy = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    toggleBalanceHidden();
  };

  return (
    <View
      className={`rounded-[28px] overflow-hidden shadow-2xl border border-emerald-400/25 ${className}`}
    >
      <LinearGradient
        colors={['#047857', '#065F46', '#092923', '#0B1522']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        className="p-6"
      >
        {/* Top Header Row: Label & Eye Privacy Toggle */}
        <View className="flex-row items-center justify-between mb-3.5">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
            <Text className="text-emerald-200 text-xs font-bold tracking-widest uppercase">
              Total Balance
            </Text>
          </View>

          {/* Privacy Eye Button */}
          <Pressable
            onPress={handleTogglePrivacy}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={isBalanceHidden ? 'Show balance' : 'Hide balance'}
            className="flex-row items-center bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full active:opacity-70"
          >
            {isBalanceHidden ? (
              <EyeOff size={14} color="#6EE7B7" />
            ) : (
              <Eye size={14} color="#6EE7B7" />
            )}
            <Text className="text-emerald-300 text-[11px] font-semibold ml-1.5">
              {isBalanceHidden ? 'Hidden' : 'Hide'}
            </Text>
          </Pressable>
        </View>

        {/* Main Amount Display: Symbol + Number */}
        <View className="flex-row items-baseline mb-4">
          <Text className="text-2xl font-bold text-emerald-300 mr-1.5">
            {symbol}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`text-4xl font-black tracking-tight ${
              isPositive ? 'text-white' : 'text-rose-300'
            }`}
          >
            {isBalanceHidden ? '• • • • • •' : formattedAmount}
          </Text>
        </View>

        {/* Bottom row: Cash status + Security pill */}
        <View className="flex-row items-center justify-between pt-3.5 border-t border-emerald-500/20">
          <View className="flex-row items-center">
            {isPositive ? (
              <TrendingUp size={15} color="#34D399" />
            ) : (
              <TrendingDown size={15} color="#F87171" />
            )}
            <Text className="text-slate-300 text-xs font-medium ml-1.5">
              {isPositive ? 'Available cash balance' : 'Deficit balance'}
            </Text>
          </View>

          <View className="flex-row items-center bg-emerald-950/70 border border-emerald-500/25 px-2.5 py-1 rounded-full">
            <ShieldCheck size={12} color="#10B981" />
            <Text className="text-emerald-300 text-[11px] font-semibold ml-1">
              Private & Safe
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
