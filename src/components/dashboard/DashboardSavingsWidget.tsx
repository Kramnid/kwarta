import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { PiggyBank, ChevronRight, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { formatCentavosToPhp } from '@/utils/currency';
import {
  calculateSavingsSummary,
  calculateGoalProgress,
} from '@/utils/savings';
import { SavingsGoalIcon, SavingsProgressBar } from '@/components/savings';

interface DashboardSavingsWidgetProps {
  className?: string;
}

export function DashboardSavingsWidget({
  className = '',
}: DashboardSavingsWidgetProps) {
  const router = useRouter();
  const { savingsGoals } = useSavingsStore();

  const summary = useMemo(
    () => calculateSavingsSummary(savingsGoals),
    [savingsGoals]
  );

  // Take top 2 active goals (or completed if no active)
  const activeGoals = savingsGoals.filter((g) => g.status === 'active');
  const featuredGoals =
    activeGoals.length > 0
      ? activeGoals.slice(0, 2)
      : savingsGoals.filter((g) => g.status !== 'archived').slice(0, 2);

  const handleNavigateAll = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/savings' as any);
  };

  const handleCreate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push('/savings/create' as any);
  };

  const handleGoalPress = (goalId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/savings/[id]',
      params: { id: goalId },
    } as any);
  };

  const formattedAllocated = formatCentavosToPhp(summary.totalAllocatedCentavos);

  // If no goals at all, render a sleek call-to-action card
  if (savingsGoals.length === 0) {
    return (
      <View
        className={`bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm ${className}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-3">
              <PiggyBank size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold">
                Start a Savings Goal
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Turn your plans into progress
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleCreate}
            className="flex-row items-center bg-emerald-600/90 active:bg-emerald-600 px-3 py-2 rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Create savings goal"
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-white text-xs font-bold ml-1">Create</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm ${className}`}
    >
      {/* Header Row: Title & View All */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-2">
            <PiggyBank size={15} color="#10B981" strokeWidth={2.3} />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Savings Goals
          </Text>
        </View>

        <Pressable
          onPress={handleNavigateAll}
          className="flex-row items-center active:opacity-70 py-1"
          accessibilityRole="button"
          accessibilityLabel="View all savings goals"
        >
          <Text className="text-emerald-400 text-xs font-semibold mr-1">
            View All ({savingsGoals.length})
          </Text>
          <ChevronRight size={14} color="#10B981" />
        </Pressable>
      </View>

      {/* Summary Banner */}
      <View className="flex-row items-baseline justify-between mb-3 pb-3 border-b border-slate-800">
        <View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Allocated to Goals
          </Text>
          <Text className="text-white text-lg font-black tracking-tight mt-0.5">
            {formattedAllocated}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Active Goals
          </Text>
          <Text className="text-slate-300 text-sm font-bold mt-0.5">
            {summary.activeGoalsCount} {summary.activeGoalsCount === 1 ? 'goal' : 'goals'}
          </Text>
        </View>
      </View>

      {/* Featured 1-2 Goals */}
      <View className="gap-2.5">
        {featuredGoals.map((goal) => {
          const progress = calculateGoalProgress(
            goal.target_centavos,
            goal.allocated_centavos
          );
          const formattedGoalAllocated = formatCentavosToPhp(
            goal.allocated_centavos
          );
          const formattedGoalTarget = formatCentavosToPhp(
            goal.target_centavos
          );

          return (
            <Pressable
              key={goal.id}
              onPress={() => handleGoalPress(goal.id)}
              className="bg-[#0B1220] p-3 rounded-xl border border-slate-800/80 active:bg-slate-800/50"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    style={{
                      backgroundColor: `${goal.color}20`,
                      borderColor: `${goal.color}40`,
                    }}
                    className="w-8 h-8 rounded-lg items-center justify-center border mr-2.5"
                  >
                    <SavingsGoalIcon
                      name={goal.icon}
                      color={goal.color}
                      size={15}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-white text-xs font-bold flex-1"
                  >
                    {goal.name}
                  </Text>
                </View>

                <Text
                  style={{ color: goal.color }}
                  className="text-xs font-black"
                >
                  {`${progress.progressPercentage.toFixed(0)}%`}
                </Text>
              </View>

              <SavingsProgressBar
                progressPercentage={progress.progressPercentage}
                cappedPercentage={progress.cappedPercentage}
                color={goal.color}
                height={5}
              />

              <View className="flex-row items-center justify-between mt-1.5">
                <Text className="text-slate-400 text-[11px]">
                  {formattedGoalAllocated}{' '}
                  <Text className="text-slate-500">/ {formattedGoalTarget}</Text>
                </Text>

                {progress.isCompleted ? (
                  <Text className="text-emerald-400 text-[10px] font-bold uppercase">
                    Completed
                  </Text>
                ) : (
                  <Text className="text-slate-500 text-[10px]">
                    {formatCentavosToPhp(progress.remainingCentavos)} left
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default DashboardSavingsWidget;
