import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { UpdateSavingsGoalInput, SavingsGoalStatus } from '@/types/savings';
import { SavingsGoalForm } from '@/components/savings/SavingsGoalForm';
import { Button } from '@/components/ui/Button';

export default function EditSavingsGoalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savingsGoals, updateGoal } = useSavingsStore();

  const goal = savingsGoals.find((g) => g.id === id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center p-6">
        <Text className="text-white text-lg font-bold">Goal Not Found</Text>
        <Text className="text-slate-400 text-xs text-center mt-2 mb-6">
          This savings goal may have been deleted or does not exist.
        </Text>
        <Button title="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleSubmit = async (
    data: UpdateSavingsGoalInput & { status?: SavingsGoalStatus }
  ) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateGoal(id, data);
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
          <Text className="text-white text-lg font-bold">Edit Savings Goal</Text>
          <Text className="text-slate-400 text-xs">
            Update your targets and details
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
        initialValues={{
          name: goal.name,
          target_centavos: goal.target_centavos,
          deadline: goal.deadline,
          icon: goal.icon,
          color: goal.color,
          note: goal.note,
          status: goal.status,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        submitButtonText="Save Changes"
      />
    </SafeAreaView>
  );
}
