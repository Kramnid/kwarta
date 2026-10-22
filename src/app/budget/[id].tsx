import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Budget, CreateBudgetInput } from '@/types/budget';
import { getBudgetById } from '@/database/budgets';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { DeleteBudgetConfirmModal } from '@/components/budgets/DeleteBudgetConfirmModal';
import { Button } from '@/components/ui/Button';

export default function EditBudgetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budgets, updateBudget, deleteBudget } = useBudgetStore();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadBudget() {
      if (!id) return;

      // 1. Check in-memory store
      const foundInStore = budgets.find((b) => b.id === id);
      if (foundInStore) {
        if (mounted) {
          setBudget(foundInStore);
          setLoading(false);
        }
        return;
      }

      // 2. Query SQLite
      try {
        const foundInDb = await getBudgetById(id);
        if (mounted) {
          setBudget(foundInDb);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load budget by ID:', err);
        if (mounted) setLoading(false);
      }
    }

    loadBudget();

    return () => {
      mounted = false;
    };
  }, [id, budgets]);

  const handleSubmit = async (inputData: CreateBudgetInput) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateBudget(id, inputData);
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

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteBudget(id);
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {
        // Fallback
      }
      router.back();
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-slate-400 text-xs mt-3">Loading budget...</Text>
      </SafeAreaView>
    );
  }

  if (!budget) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] p-6 justify-center items-center">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center mb-4 border border-slate-700">
          <AlertCircle size={32} color="#F87171" />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          Budget Not Found
        </Text>
        <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-5 mb-6">
          This budget may have already been deleted or does not exist.
        </Text>
        <Button title="Return to Budgets" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const budgetDisplayName = budget.category?.name
    ? `${budget.category.name} Budget`
    : 'Overall Monthly Budget';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#0B1220]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-[#151F30]">
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700 mr-3"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={18} color="#94A3B8" />
        </Pressable>

        <View className="flex-1">
          <Text className="text-white text-lg font-bold">Edit Budget</Text>
          <Text className="text-slate-400 text-xs">{budgetDisplayName}</Text>
        </View>

        <Pressable
          onPress={() => setDeleteModalVisible(true)}
          className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center active:bg-red-500/25"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Delete budget"
        >
          <Trash2 size={16} color="#F87171" />
        </Pressable>
      </View>

      {/* Form Component */}
      <BudgetForm
        initialData={{
          id: budget.id,
          category_id: budget.category_id,
          amount_centavos: budget.amount_centavos,
          month: budget.month,
        }}
        isEditing={true}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBudgetConfirmModal
        visible={deleteModalVisible}
        budgetName={budgetDisplayName}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}
