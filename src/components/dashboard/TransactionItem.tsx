import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Briefcase,
  MoreHorizontal,
  House,
  Film,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Gift,
  TrendingUp,
  Receipt,
  ArrowDownLeft,
} from 'lucide-react-native';
import { Transaction } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { formatTransactionDate } from '@/utils/date';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  showDivider?: boolean;
}

/**
 * Returns the matching Lucide icon based on category icon identifier.
 */
function getCategoryIcon(iconName?: string, type?: string, color: string = '#94A3B8') {
  const size = 18;
  const normalized = (iconName || '').toLowerCase().replace(/_/g, '-');

  switch (normalized) {
    case 'utensils':
    case 'food':
      return <Utensils size={size} color={color} />;
    case 'shopping-bag':
    case 'shopping':
      return <ShoppingBag size={size} color={color} />;
    case 'car':
    case 'transportation':
      return <Car size={size} color={color} />;
    case 'zap':
    case 'bills':
    case 'utilities':
      return <Zap size={size} color={color} />;
    case 'briefcase':
    case 'salary':
      return <Briefcase size={size} color={color} />;
    case 'home':
    case 'rent':
      return <House size={size} color={color} />;
    case 'film':
    case 'entertainment':
      return <Film size={size} color={color} />;
    case 'heart-pulse':
    case 'health':
      return <HeartPulse size={size} color={color} />;
    case 'graduation-cap':
    case 'education':
      return <GraduationCap size={size} color={color} />;
    case 'sparkles':
      return <Sparkles size={size} color={color} />;
    case 'gift':
      return <Gift size={size} color={color} />;
    case 'trending-up':
      return <TrendingUp size={size} color={color} />;
    case 'more-horizontal':
    case 'other':
      return <MoreHorizontal size={size} color={color} />;
    default:
      return type === 'income' ? (
        <ArrowDownLeft size={size} color={color} />
      ) : (
        <Receipt size={size} color={color} />
      );
  }
}

export function TransactionItem({
  transaction,
  onPress,
  showDivider = true,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const category = transaction.category;
  const categoryColor = category?.color || (isIncome ? '#10B981' : '#F87171');
  const formattedAmount = formatCentavosToPhp(transaction.amount);
  const formattedDate = formatTransactionDate(transaction.date);

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      className="active:bg-slate-800/40 px-3 py-3 rounded-2xl transition-all"
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description || 'Transaction'}, ${formattedAmount}`}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Category Icon Container + Title & Subtitle */}
        <View className="flex-row items-center flex-1 mr-3">
          <View
            style={{ backgroundColor: `${categoryColor}1F` }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-white/5 mr-3"
          >
            {getCategoryIcon(category?.icon, transaction.type, categoryColor)}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-white text-sm font-semibold tracking-tight"
            >
              {transaction.description || category?.name || 'Untitled Transaction'}
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
          {transaction.payment_method ? (
            <Text className="text-slate-500 text-[11px] mt-0.5">
              {transaction.payment_method}
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
