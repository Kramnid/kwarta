import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAccountsStore, useSettingsStore } from '@/store';
import { CreateAccountCardInput } from '@/types/accounts';
import { CardForm } from '@/components/accounts/CardForm';

export default function AddAccountCardScreen() {
  const router = useRouter();
  const { addCard } = useAccountsStore();
  const { displayName } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (cardInput: CreateAccountCardInput) => {
    setIsSubmitting(true);
    try {
      await addCard(cardInput);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#0B1220]">
      {/* Top Modal Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-700/60 bg-[#151F30]">
        <View className="flex-1 mr-3">
          <Text className="text-white text-lg font-bold">Add Account Card</Text>
          <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
            Choose a Philippine card template or customize your card
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={16} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Card Form */}
      <CardForm
        initialCardholderName={displayName}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
