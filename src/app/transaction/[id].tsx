import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store';
import { Transaction, CreateTransactionInput } from '@/types/finance';
import { getTransactionById } from '@/database';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, editTransaction, removeTransaction } = useAppStore();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTransaction() {
      if (!id) return;

      // 1. Check in-memory store first
      const foundInStore = transactions.find((t) => t.id === id);
      if (foundInStore) {
        if (mounted) {
          setTransaction(foundInStore);
          setLoading(false);
        }
        return;
      }

      // 2. Query SQLite directly
      try {
        const foundInDb = await getTransactionById(id);
        if (mounted) {
          setTransaction(foundInDb);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load transaction by ID:', err);
        if (mounted) setLoading(false);
      }
    }

    loadTransaction();

    return () => {
      mounted = false;
    };
  }, [id, transactions]);

  const handleSubmit = async (inputData: CreateTransactionInput) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await editTransaction(id, inputData);
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
      await removeTransaction(id);
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
        <Text className="text-slate-400 text-xs mt-3">Loading transaction...</Text>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] p-6 justify-center items-center">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center mb-4 border border-slate-700">
          <AlertCircle size={32} color="#F87171" />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
          Transaction Not Found
        </Text>
        <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-5 mb-6">
          This transaction may have already been deleted or does not exist.
        </Text>
        <Button title="Return to Transactions" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

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

        <Text className="text-white text-lg font-bold flex-1">
          Edit Transaction
        </Text>

        <Pressable
          onPress={() => setDeleteModalVisible(true)}
          className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center active:bg-red-500/25"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
        >
          <Trash2 size={16} color="#F87171" />
        </Pressable>
      </View>

      {/* Form Component */}
      <TransactionForm
        initialData={{
          id: transaction.id,
          type: transaction.type,
          amount_centavos: transaction.amount_centavos,
          category_id: transaction.category_id,
          title: transaction.title,
          note: transaction.note,
          transaction_date: transaction.transaction_date,
        }}
        isEditing={true}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />

      {/* Header Delete Modal Trigger */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}
