import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
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

  const displayAmount = isBalanceHidden
    ? `${symbol} ••••••`
    : `${isPositive ? '' : '-'}${symbol} ${formattedAmount}`;

  return (
    <View
      className={`rounded-2xl overflow-hidden border border-slate-700/80 bg-[#151F30] shadow-lg ${className}`}
    >
      {/* Top emerald signature accent strip */}
      <View className="h-[3px] bg-emerald-500 w-full" />

      {/* Main card body with guaranteed style padding for 100% cross-platform reliability */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 18,
        }}
      >
        {/* Top Header Row: Label & Privacy Eye Toggle */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
            <Text className="text-slate-300 text-xs font-bold tracking-wider uppercase">
              Total Balance
            </Text>
          </View>

          {/* Privacy Eye Toggle Button */}
          <Pressable
            onPress={handleTogglePrivacy}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={isBalanceHidden ? 'Show balance' : 'Hide balance'}
            className="flex-row items-center bg-slate-800 border border-slate-600 px-3 py-1.5 rounded-full active:bg-slate-700"
          >
            {isBalanceHidden ? (
              <EyeOff size={13} color="#E2E8F0" />
            ) : (
              <Eye size={13} color="#E2E8F0" />
            )}
            <Text className="text-slate-200 text-xs font-semibold ml-1.5">
              {isBalanceHidden ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        </View>

        {/* Main Balance Display: High Contrast Crisp White Text */}
        <View className="mt-1">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`text-[36px] font-black tracking-tight ${
              isPositive ? 'text-white' : 'text-rose-400'
            }`}
          >
            {displayAmount}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default BalanceCard;
