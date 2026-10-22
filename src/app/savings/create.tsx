import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { CreateSavingsGoalInput } from '@/types/savings';
import { SavingsGoalForm } from '@/components/savings/SavingsGoalForm';

export default function CreateSavingsGoalScreen() {
  const router = useRouter();
  const { createGoal } = useSavingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateSavingsGoalInput) => {
    setIsSubmitting(true);
    try {
      await createGoal(data);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {}
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800">
        <View>
          <Text className="text-white text-lg font-bold">New Savings Goal</Text>
          <Text className="text-slate-400 text-xs">
            Set your target and start saving
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-800/80 items-center justify-center active:bg-slate-700"
          accessibilityRole="button"
          accessibilityLabel="Close form"
        >
          <X size={18} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Form */}
      <SavingsGoalForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        submitButtonText="Create Goal"
      />
    </SafeAreaView>
  );
}
