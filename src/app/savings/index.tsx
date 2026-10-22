import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { SavingsGoalStatus } from '@/types/savings';
import { calculateSavingsSummary } from '@/utils/savings';
import {
  SavingsSummaryCard,
  SavingsGoalCard,
  SavingsEmptyState,
} from '@/components/savings';

type FilterType = 'all' | SavingsGoalStatus;

export default function SavingsGoalsScreen() {
  const router = useRouter();
  const { savingsGoals, refreshSavings, isLoadingSavings } = useSavingsStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summary = useMemo(
    () => calculateSavingsSummary(savingsGoals),
    [savingsGoals]
  );

  const filteredGoals = useMemo(() => {
    if (activeFilter === 'all') {
      // Show active and completed first, archived at bottom or filtered separately
      return savingsGoals.filter((g) => g.status !== 'archived');
    }
    return savingsGoals.filter((g) => g.status === activeFilter);
  }, [savingsGoals, activeFilter]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshSavings();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSavings]);

  const handleCreate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push('/savings/create' as any);
  };

  const handleFilterSelect = (filter: FilterType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setActiveFilter(filter);
  };

  const filterTabs: { id: FilterType; label: string; count?: number }[] = [
    {
      id: 'all',
      label: 'All',
      count: savingsGoals.filter((g) => g.status !== 'archived').length,
    },
    { id: 'active', label: 'Active', count: summary.activeGoalsCount },
    { id: 'completed', label: 'Completed', count: summary.completedGoalsCount },
    { id: 'archived', label: 'Archived', count: summary.archivedGoalsCount },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Top Navigation Header */}
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

          <View className="flex-1">
            <Text className="text-white text-xl font-bold tracking-tight">
              Savings Goals
            </Text>
            <Text className="text-slate-400 text-xs">
              Turn your plans into progress.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleCreate}
          className="w-10 h-10 rounded-2xl bg-emerald-600 items-center justify-center active:bg-emerald-700 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Create new savings goal"
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingSavings}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* 1. Summary Card */}
        <SavingsSummaryCard summary={summary} className="mb-5" />

        {/* 2. Filter Chips */}
        <View className="flex-row bg-[#151F30] p-1 rounded-2xl border border-slate-700/60 mb-5">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => handleFilterSelect(tab.id)}
                className={`flex-1 py-2 rounded-xl items-center justify-center flex-row ${
                  isSelected
                    ? 'bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
                    : ''
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${tab.label}`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 ? (
                  <Text
                    className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* 3. Goals List or Empty State */}
        {filteredGoals.length === 0 ? (
          <SavingsEmptyState filterStatus={activeFilter} />
        ) : (
          <View className="gap-3.5">
            {filteredGoals.map((goal) => (
              <SavingsGoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
