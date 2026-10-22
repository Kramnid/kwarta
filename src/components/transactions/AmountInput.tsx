import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  type: 'expense' | 'income';
  error?: string;
  className?: string;
  quickAmounts?: number[];
  label?: string;
  autoFocus?: boolean;
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
  quickAmounts = [50, 100, 500, 1000],
  label = 'Amount',
  autoFocus = false,
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isIncome = type === 'income';
  const currencyColor = isIncome ? '#10B981' : '#F87171';
  const activeBorderColor = error
    ? 'rgba(248, 113, 113, 0.8)'
    : isFocused
    ? isIncome
      ? 'rgba(16, 185, 129, 0.7)'
      : 'rgba(248, 113, 113, 0.7)'
    : 'rgba(51, 65, 85, 0.7)';

  const handleChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');

    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
    }

    onChangeText(cleaned);
  };

  const handleQuickAdd = (incrementPesos: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const currentCentavos = stringToCentavos(value);
    const newCentavos = currentCentavos + incrementPesos * 100;
    onChangeText(centavosToEditableString(newCentavos));
  };

  const handleClear = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onChangeText('');
  };

  return (
    <Card
      style={{
        borderColor: activeBorderColor,
        borderWidth: 1.5,
        backgroundColor: '#151F30',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
      }}
      className={className}
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </Text>
        <Text className="text-slate-500 text-[11px] font-semibold">Philippine Peso (PHP)</Text>
      </View>

      <View className="flex-row items-baseline py-1">
        <Text
          style={{
            fontSize: 36,
            fontWeight: '900',
            color: currencyColor,
            marginRight: 6,
          }}
        >
          ₱
        </Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          style={{
            flex: 1,
            fontSize: 38,
            fontWeight: '900',
            color: '#FFFFFF',
            minHeight: 52,
            paddingVertical: 0,
          }}
          accessibilityLabel="Transaction amount"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={10}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#1E293B',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
              borderWidth: 1,
              borderColor: '#334155',
            }}
            accessibilityLabel="Clear amount"
          >
            <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Quick Add Chips */}
      {quickAmounts && quickAmounts.length > 0 && (
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(51, 65, 85, 0.4)' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {quickAmounts.map((amt) => (
              <Pressable
                key={`quick-${amt}`}
                onPress={() => handleQuickAdd(amt)}
                style={{
                  backgroundColor: '#1E293B',
                  borderWidth: 1,
                  borderColor: '#334155',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '700' }}>
                  +₱{amt.toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {error ? (
        <Text className="text-red-400 text-xs mt-2.5 font-medium">{error}</Text>
      ) : null}
    </Card>
  );
}
