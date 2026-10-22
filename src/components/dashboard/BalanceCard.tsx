import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, ShieldCheck, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatCentavosToPhp } from '@/utils/currency';
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
  const formattedBalance = formatCentavosToPhp(balanceCentavos);

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
      className={`rounded-[30px] overflow-hidden shadow-2xl border border-emerald-500/30 ${className}`}
    >
      <LinearGradient
        colors={['#065F46', '#064E3B', '#0B1B2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6 relative"
      >
        {/* Subtle decorative glow circles */}
        <View className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />

        {/* Top Header Row: Label, Eye Privacy Toggle & Wallet Icon */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
            <Text className="text-emerald-300 text-xs font-bold tracking-widest uppercase">
              Total Balance
            </Text>

            {/* Privacy Eye Toggle */}
            <Pressable
              onPress={handleTogglePrivacy}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isBalanceHidden ? 'Show balance' : 'Hide balance'}
              className="ml-2.5 p-1 rounded-full bg-emerald-950/50 border border-emerald-500/20 active:opacity-70"
            >
              {isBalanceHidden ? (
                <EyeOff size={14} color="#6EE7B7" />
              ) : (
                <Eye size={14} color="#6EE7B7" />
              )}
            </Pressable>
          </View>

          {/* Wallet Icon Pill */}
          <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 items-center justify-center shadow-sm">
            <Wallet size={19} color="#34D399" />
          </View>
        </View>

        {/* Main Amount Display */}
        <View className="mb-4">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`text-4xl font-extrabold tracking-tight ${
              isPositive ? 'text-white' : 'text-rose-300'
            }`}
          >
            {isBalanceHidden ? '₱ • • • • • •' : formattedBalance}
          </Text>
        </View>

        {/* Bottom row: Status & Security pill */}
        <View className="flex-row items-center justify-between pt-3.5 border-t border-emerald-500/20">
          <View className="flex-row items-center">
            {isPositive ? (
              <TrendingUp size={15} color="#34D399" />
            ) : (
              <TrendingDown size={15} color="#F87171" />
            )}
            <Text className="text-slate-300 text-xs font-medium ml-1.5">
              {isPositive ? 'Available cash balance' : 'Overdraft balance'}
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
