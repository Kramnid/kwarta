import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionType } from '@/types/finance';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
}

export function TransactionTypeSelector({
  value,
  onChange,
  className = '',
}: TransactionTypeSelectorProps) {
  const handleSelect = (nextType: TransactionType) => {
    if (nextType !== value) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback
      }
      onChange(nextType);
    }
  };

  const isExpense = value === 'expense';
  const isIncome = value === 'income';

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#151F30',
        padding: 5,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.7)',
      }}
      className={className}
    >
      {/* Expense Segment */}
      <Pressable
        onPress={() => handleSelect('expense')}
        accessibilityRole="button"
        accessibilityLabel="Expense mode"
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: isExpense ? 'rgba(248, 113, 113, 0.15)' : 'transparent',
          borderWidth: isExpense ? 1.5 : 0,
          borderColor: isExpense ? '#F87171' : 'transparent',
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: isExpense ? '#F87171' : 'rgba(148, 163, 184, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <ArrowDown
            size={15}
            color={isExpense ? '#0B1220' : '#94A3B8'}
            strokeWidth={2.5}
          />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '800',
            color: isExpense ? '#F87171' : '#94A3B8',
          }}
        >
          Expense
        </Text>
      </Pressable>

      {/* Income Segment */}
      <Pressable
        onPress={() => handleSelect('income')}
        accessibilityRole="button"
        accessibilityLabel="Income mode"
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          borderWidth: isIncome ? 1.5 : 0,
          borderColor: isIncome ? '#10B981' : 'transparent',
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: isIncome ? '#10B981' : 'rgba(148, 163, 184, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <ArrowUp
            size={15}
            color={isIncome ? '#0B1220' : '#94A3B8'}
            strokeWidth={2.5}
          />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '800',
            color: isIncome ? '#10B981' : '#94A3B8',
          }}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}
