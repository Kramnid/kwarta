import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatCentavosToPhp } from '@/utils/currency';

interface BalanceCardProps {
  balanceCentavos: number;
  className?: string;
}

export function BalanceCard({
  balanceCentavos,
  className = '',
}: BalanceCardProps) {
  const isPositive = balanceCentavos >= 0;
  const formattedBalance = formatCentavosToPhp(balanceCentavos);

  return (
    <View
      className={`rounded-[28px] overflow-hidden shadow-2xl border border-emerald-500/25 ${className}`}
    >
      <LinearGradient
        colors={['#064E3B', '#092E25', '#0B1726']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        className="p-6 relative"
      >
        {/* Subtle decorative glow shapes in background */}
        <View className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <View className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-emerald-400/5 blur-2xl" />

        {/* Top row: Label & Wallet Icon */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
            <Text className="text-emerald-300 text-xs font-bold tracking-widest uppercase">
              Total Balance
            </Text>
          </View>

          <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
            <Wallet size={19} color="#34D399" />
          </View>
        </View>

        {/* Main Amount */}
        <View className="mb-4">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`text-4xl font-extrabold tracking-tight ${
              isPositive ? 'text-white' : 'text-rose-300'
            }`}
          >
            {formattedBalance}
          </Text>
        </View>

        {/* Bottom row: Subtitle + Security/Status Indicator */}
        <View className="flex-row items-center justify-between pt-3.5 border-t border-emerald-500/20">
          <View className="flex-row items-center">
            {isPositive ? (
              <TrendingUp size={14} color="#34D399" />
            ) : (
              <TrendingDown size={14} color="#F87171" />
            )}
            <Text className="text-slate-300 text-xs font-medium ml-1.5">
              Available balance
            </Text>
          </View>

          <View className="flex-row items-center bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck size={12} color="#10B981" />
            <Text className="text-emerald-400 text-[11px] font-semibold ml-1">
              Protected & Private
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
