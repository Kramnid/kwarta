import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Transaction } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { formatTransactionDate } from '@/utils/date';
import { getEffectiveAmount, getEffectiveDate } from '@/utils/finance';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  showDivider?: boolean;
}

export function TransactionItem({
  transaction,
  onPress,
  showDivider = true,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const category = transaction.category;
  const categoryColor = category?.color || (isIncome ? '#10B981' : '#F87171');
  const amount = getEffectiveAmount(transaction);
  const formattedAmount = formatCentavosToPhp(amount);
  const formattedDate = formatTransactionDate(getEffectiveDate(transaction));
  const title = transaction.title || transaction.description || 'Untitled Transaction';

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      className="active:bg-slate-800/60 px-3 py-3 rounded-2xl transition-all"
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formattedAmount}`}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Category Icon Container + Title & Subtitle */}
        <View className="flex-row items-center flex-1 mr-3">
          <View
            style={{ backgroundColor: `${categoryColor}1F` }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-white/10 mr-3 shadow-sm"
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
              {title}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-slate-400 text-xs">
                {category?.name || (isIncome ? 'Income' : 'Expense')}
              </Text>
              {formattedDate ? (
                <>
                  <Text className="text-slate-600 text-xs mx-1.5">•</Text>
                  <Text className="text-slate-400 text-xs">{formattedDate}</Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        {/* Right: Amount Display */}
        <View className="items-end">
          <Text
            className={`text-sm font-bold tracking-tight ${
              isIncome ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            {isIncome ? `+${formattedAmount}` : `-${formattedAmount}`}
          </Text>
          {transaction.note ? (
            <Text
              numberOfLines={1}
              className="text-slate-500 text-[11px] mt-0.5 max-w-[120px]"
            >
              {transaction.note}
            </Text>
          ) : null}
        </View>
      </View>

      {showDivider && (
        <View className="h-[1px] bg-slate-800/80 mt-3 -mx-1" />
      )}
    </Pressable>
  );
}
