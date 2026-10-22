import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  type: 'expense' | 'income';
  error?: string;
  className?: string;
}

/**
 * Pure integer-safe conversion of a user input string to integer centavos.
 * Avoids floating-point math completely.
 */
export function stringToCentavos(str: string): number {
  const cleaned = str.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;

  const parts = cleaned.split('.');
  const whole = parseInt(parts[0] || '0', 10);
  let fraction = 0;

  if (parts.length > 1) {
    const fracStr = (parts[1] || '').substring(0, 2).padEnd(2, '0');
    fraction = parseInt(fracStr, 10);
  }

  return (isNaN(whole) ? 0 : whole) * 100 + (isNaN(fraction) ? 0 : fraction);
}

/**
 * Converts integer centavos to user editable string (e.g. 12550 -> "125.50").
 */
export function centavosToEditableString(centavos: number): string {
  if (!centavos || centavos <= 0) return '';
  const pesos = (centavos / 100).toFixed(2);
  return pesos.endsWith('.00') ? String(Math.floor(centavos / 100)) : pesos;
}

export function AmountInput({
  value,
  onChangeText,
  type,
  error,
  className = '',
}: AmountInputProps) {
  const isIncome = type === 'income';
  const accentColor = isIncome ? 'text-emerald-400' : 'text-rose-400';

  const handleChange = (text: string) => {
    // Strip everything except digits and single dot
    let cleaned = text.replace(/[^0-9.]/g, '');

    // Allow at most one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Limit decimal places to maximum 2
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    // Prevent leading zeros unless followed by decimal point (e.g. "0.5")
    if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
    }

    onChangeText(cleaned);
  };

  return (
    <Card className={`mb-4 border ${error ? 'border-red-500/80' : 'border-slate-700/60'} ${className}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Amount
        </Text>
        <Text className="text-slate-500 text-xs">PHP (₱)</Text>
      </View>

      <View className="flex-row items-center py-1">
        <Text className={`text-4xl font-extrabold mr-2 ${accentColor}`}>
          ₱
        </Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="decimal-pad"
          autoFocus={false}
          className="flex-1 text-4xl font-extrabold text-white py-1"
          style={{ minHeight: 48 }}
          accessibilityLabel="Transaction amount"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            className="w-7 h-7 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700 ml-2"
            accessibilityLabel="Clear amount"
          >
            <Text className="text-slate-400 text-xs font-bold">✕</Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text className="text-red-400 text-xs mt-2 font-medium">{error}</Text>
      ) : null}
    </Card>
  );
}
