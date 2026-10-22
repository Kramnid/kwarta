import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store';
import { CreateTransactionInput, TransactionType } from '@/types/finance';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { addTransaction } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialType: TransactionType =
    params.type === 'income' ? 'income' : 'expense';

  const handleSubmit = async (inputData: CreateTransactionInput) => {
    setIsSubmitting(true);
    try {
      await addTransaction(inputData);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {
        // Fallback
      }
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#0B1220]">
      {/* Top Modal Navigation Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-[#151F30]">
        <Text className="text-white text-lg font-bold">New Transaction</Text>
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={18} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Form Content */}
      <TransactionForm
        initialData={{ type: initialType }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
