import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBudgetStore } from '@/store/useBudgetStore';
import { CreateBudgetInput } from '@/types/budget';
import { BudgetForm } from '@/components/budgets/BudgetForm';

export default function AddBudgetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: 'overall' | 'category'; month?: string }>();
  const { createBudget } = useBudgetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialType = params.type || 'overall';
  const initialMonth = params.month;

  const handleSubmit = async (inputData: CreateBudgetInput) => {
    setIsSubmitting(true);
    try {
      await createBudget(inputData);
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
        <View>
          <Text className="text-white text-lg font-bold">Create Budget</Text>
          <Text className="text-slate-400 text-xs">
            Set a limit and take control of your spending.
          </Text>
        </View>

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
      <BudgetForm
        initialData={{
          category_id: initialType === 'category' ? undefined : null,
          month: initialMonth,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
