import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Transaction } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { getEffectiveAmount } from '@/utils/finance';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListItemProps {
  transaction: Transaction;
  showDivider?: boolean;
}

export function TransactionListItem({
  transaction,
  showDivider = true,
}: TransactionListItemProps) {
  const router = useRouter();
  const isIncome = transaction.type === 'income';
  const category = transaction.category;
  const categoryColor = category?.color || (isIncome ? '#10B981' : '#F87171');
  const amount = getEffectiveAmount(transaction);
  const formattedAmount = formatCentavosToPhp(amount);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push({
      pathname: '/transaction/[id]',
      params: { id: transaction.id },
    } as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.title || 'Transaction'}, ${formattedAmount}`}
      className="active:bg-slate-800/40 px-3.5 py-3 rounded-2xl transition-all"
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Category Icon + Title + Category Subtitle */}
        <View className="flex-row items-center flex-1 mr-3">
          <View
            style={{ backgroundColor: `${categoryColor}20` }}
            className="w-11 h-11 rounded-2xl items-center justify-center mr-3 border border-white/5"
          >
            <CategoryIcon
              name={category?.icon}
              color={categoryColor}
              size={19}
            />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-white text-sm font-semibold tracking-tight"
            >
              {transaction.title || transaction.description || 'Untitled Transaction'}
            </Text>

            <View className="flex-row items-center mt-0.5">
              <Text className="text-slate-400 text-xs">
                {category?.name || (isIncome ? 'Income' : 'Expense')}
              </Text>
              {transaction.note ? (
                <>
                  <Text className="text-slate-600 text-xs mx-1.5">•</Text>
                  <Text
                    numberOfLines={1}
                    className="text-slate-400 text-xs flex-1"
                  >
                    {transaction.note}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        {/* Right: Formatted Amount */}
        <View className="items-end">
          <Text
            className={`text-sm font-bold tracking-tight ${
              isIncome ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isIncome ? `+${formattedAmount}` : `-${formattedAmount}`}
          </Text>
        </View>
      </View>

      {showDivider && (
        <View className="h-[1px] bg-slate-800/80 mt-3 -mx-1" />
      )}
    </Pressable>
  );
}
