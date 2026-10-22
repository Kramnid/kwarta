import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Calendar,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { SavingsEntryType } from '@/types/savings';
import { formatCentavosToPhp } from '@/utils/currency';
import {
  calculateGoalProgress,
  formatDeadline,
  formatDaysRemainingText,
} from '@/utils/savings';
import { SavingsGoalIcon } from '@/components/savings/SavingsGoalIcon';
import { SavingsProgressBar } from '@/components/savings/SavingsProgressBar';
import { SavingsEntryModal } from '@/components/savings/SavingsEntryModal';
import { SavingsHistoryList } from '@/components/savings/SavingsHistoryList';
import { DeleteGoalConfirmModal } from '@/components/savings/DeleteGoalConfirmModal';
import { Button } from '@/components/ui/Button';

export default function SavingsGoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    savingsGoals,
    savingsEntries,
    loadEntriesForGoal,
    refreshSavings,
    deleteGoal,
    addEntry,
    removeEntry,
  } = useSavingsStore();

  const goal = useMemo(
    () => savingsGoals.find((g) => g.id === id) || null,
    [savingsGoals, id]
  );

  const entries = useMemo(
    () => (id && savingsEntries[id]) || [],
    [savingsEntries, id]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [entryModalType, setEntryModalType] = useState<SavingsEntryType>('contribution');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!id) return;
      try {
        await Promise.all([refreshSavings(), loadEntriesForGoal(id)]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id, loadEntriesForGoal, refreshSavings]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      await Promise.all([refreshSavings(), loadEntriesForGoal(id)]);
    } finally {
      setIsRefreshing(false);
    }
  }, [id, refreshSavings, loadEntriesForGoal]);

  const handleOpenEntryModal = (type: SavingsEntryType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setEntryModalType(type);
    setEntryModalVisible(true);
  };

  const handleEntrySubmit = async (data: {
    type: SavingsEntryType;
    amount_centavos: number;
    note?: string | null;
    entry_date: string;
  }) => {
    if (!id) return;
    await addEntry({
      goal_id: id,
      type: data.type,
      amount_centavos: data.amount_centavos,
      note: data.note,
      entry_date: data.entry_date,
    });
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!id) return;
    await removeEntry(id, entryId);
  };

  const handleDeleteGoal = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteGoal(id);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setDeleteModalVisible(false);
      router.back();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/savings/[id]/edit',
      params: { id },
    } as any);
  };

  if (isLoading && !goal) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1220] items-center justify-center p-6">
        <Text className="text-white text-lg font-bold">Goal Not Found</Text>
        <Text className="text-slate-400 text-xs text-center mt-2 mb-6">
          This savings goal may have been deleted or does not exist.
        </Text>
        <Button title="Back to Goals" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const progress = calculateGoalProgress(
    goal.target_centavos,
    goal.allocated_centavos
  );

  const formattedAllocated = formatCentavosToPhp(goal.allocated_centavos);
  const formattedTarget = formatCentavosToPhp(goal.target_centavos);
  const formattedRemaining = formatCentavosToPhp(progress.remainingCentavos);
  const formattedDeadlineDate = formatDeadline(goal.deadline);
  const daysRemainingText = formatDaysRemainingText(goal.deadline);
  const isCompleted = progress.isCompleted || goal.status === 'completed';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Navigation Header */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800/80">
        <View className="flex-row items-center flex-1 mr-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 items-center justify-center mr-3 active:bg-slate-700 border border-slate-700/60"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={18} color="#F8FAFC" />
          </Pressable>

          <Text
            numberOfLines={1}
            className="text-white text-lg font-bold tracking-tight flex-1"
          >
            {goal.name}
          </Text>
        </View>

        {/* Action Icons: Edit & Delete */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={handleEdit}
            className="w-10 h-10 rounded-2xl bg-slate-800 items-center justify-center active:bg-slate-700 border border-slate-700/60"
            accessibilityRole="button"
            accessibilityLabel="Edit goal"
          >
            <Edit2 size={16} color="#94A3B8" />
          </Pressable>

          <Pressable
            onPress={() => setDeleteModalVisible(true)}
            className="w-10 h-10 rounded-2xl bg-rose-500/15 items-center justify-center active:bg-rose-500/25 border border-rose-500/30"
            accessibilityRole="button"
            accessibilityLabel="Delete goal"
          >
            <Trash2 size={16} color="#F87171" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* 1. Main Hero Progress Card */}
        <View
          style={{ borderColor: `${goal.color}40` }}
          className="bg-[#151F30] rounded-3xl p-5 border shadow-xl mb-5"
        >
          {/* Card Header: Icon, Status */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                style={{
                  backgroundColor: `${goal.color}22`,
                  borderColor: `${goal.color}44`,
                }}
                className="w-12 h-12 rounded-2xl items-center justify-center border mr-3"
              >
                <SavingsGoalIcon
                  name={goal.icon}
                  color={goal.color}
                  size={24}
                  strokeWidth={2.3}
                />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">{goal.name}</Text>
                <Text className="text-slate-400 text-xs">Target: {formattedTarget}</Text>
              </View>
            </View>

            {isCompleted ? (
              <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 size={12} color="#34D399" />
                <Text className="text-emerald-300 text-xs font-bold ml-1">
                  Completed
                </Text>
              </View>
            ) : (
              <View className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                <Text className="text-slate-300 text-xs font-bold capitalize">
                  {goal.status}
                </Text>
              </View>
            )}
          </View>

          {/* Amount Display */}
          <View className="items-center py-3">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Currently Saved
            </Text>
            <Text className="text-white text-3xl font-black tracking-tight">
              {formattedAllocated}
            </Text>
            <Text className="text-slate-400 text-xs font-medium mt-1">
              of {formattedTarget} target
            </Text>
          </View>

          {/* Progress Bar & Percentage */}
          <View className="mt-2 mb-3">
            <SavingsProgressBar
              progressPercentage={progress.progressPercentage}
              cappedPercentage={progress.cappedPercentage}
              color={goal.color}
              height={10}
              showText
            />
          </View>

          {/* Details Row: Remaining & Deadline */}
          <View className="flex-row items-center justify-between pt-3 border-t border-slate-800">
            <View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase">
                Remaining
              </Text>
              <Text className="text-slate-200 text-sm font-bold">
                {isCompleted ? '₱0.00' : formattedRemaining}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-slate-500 text-[10px] font-bold uppercase">
                Deadline
              </Text>
              <View className="flex-row items-center">
                <Calendar size={12} color="#94A3B8" />
                <Text className="text-slate-200 text-xs font-semibold ml-1">
                  {formattedDeadlineDate || 'None'}
                </Text>
              </View>
              {daysRemainingText && !isCompleted ? (
                <Text className="text-slate-400 text-[10px] mt-0.5">
                  {daysRemainingText}
                </Text>
              ) : null}
            </View>
          </View>

          {goal.note ? (
            <View className="mt-3 pt-3 border-t border-slate-800/80">
              <Text className="text-slate-400 text-xs italic">
                &ldquo;{goal.note}&rdquo;
              </Text>
            </View>
          ) : null}
        </View>

        {/* 2. Quick Action Buttons: Add Money & Withdraw */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => handleOpenEntryModal('contribution')}
            className="flex-1 bg-emerald-600 active:bg-emerald-700 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Add money to goal"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text className="text-white text-sm font-bold">Add Money</Text>
          </Pressable>

          <Pressable
            onPress={() => handleOpenEntryModal('withdrawal')}
            disabled={goal.allocated_centavos <= 0}
            className={`flex-1 py-3.5 px-4 rounded-2xl flex-row items-center justify-center border shadow-sm ${
              goal.allocated_centavos > 0
                ? 'bg-rose-500/15 border-rose-500/30 active:bg-rose-500/25'
                : 'bg-slate-800/40 border-slate-800 opacity-50'
            }`}
            accessibilityRole="button"
            accessibilityLabel="Withdraw from goal"
          >
            <Minus
              size={18}
              color={goal.allocated_centavos > 0 ? '#F87171' : '#94A3B8'}
              strokeWidth={2.5}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-sm font-bold ${
                goal.allocated_centavos > 0 ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              Withdraw
            </Text>
          </Pressable>
        </View>

        {/* 3. Accounting Explainer Note */}
        <View className="flex-row items-center bg-[#151F30]/60 p-3.5 rounded-2xl border border-slate-700/50 mb-6">
          <Info size={16} color="#94A3B8" />
          <Text className="text-slate-400 text-xs ml-2.5 flex-1">
            Savings contributions and withdrawals represent manual goal allocations and do not affect your regular balance or budgets.
          </Text>
        </View>

        {/* 4. Savings Activity History */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-white text-base font-bold">Savings History</Text>
            <Text className="text-slate-400 text-xs font-semibold">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          <SavingsHistoryList
            entries={entries}
            onDeleteEntry={handleDeleteEntry}
          />
        </View>
      </ScrollView>

      {/* Add / Withdraw Entry Modal */}
      <SavingsEntryModal
        visible={entryModalVisible}
        goal={goal}
        initialType={entryModalType}
        onClose={() => setEntryModalVisible(false)}
        onSubmit={handleEntrySubmit}
      />

      {/* Delete Goal Confirmation Modal */}
      <DeleteGoalConfirmModal
        visible={deleteModalVisible}
        goalName={goal.name}
        onConfirm={handleDeleteGoal}
        onCancel={() => setDeleteModalVisible(false)}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}
