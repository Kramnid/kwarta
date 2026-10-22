import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSavingsStore } from '@/store';
import { SavingsGoalStatus } from '@/types/savings';
import { calculateSavingsSummary } from '@/utils/savings';
import { Button } from '@/components/ui/Button';
import {
  SavingsSummaryCard,
  SavingsGoalCard,
  SavingsEmptyState,
} from '@/components/savings';

type FilterType = 'all' | SavingsGoalStatus;

export default function SavingsTabScreen() {
  const router = useRouter();
  const { savingsGoals, refreshSavings, isLoadingSavings } = useSavingsStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summary = useMemo(
    () => calculateSavingsSummary(savingsGoals),
    [savingsGoals]
  );

  const hasGoals = savingsGoals.length > 0;

  const filteredGoals = useMemo(() => {
    if (activeFilter === 'all') {
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 96,
        }}
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
        {/* 1. Header Bar matching Kwarta Tab Design System */}
        <View className="flex-row items-center justify-between mb-4 pt-1">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                SAVINGS & TARGETS
              </Text>
              {hasGoals && (
                <>
                  <Text className="text-slate-600 text-xs mx-1.5">•</Text>
                  <Text className="text-emerald-400 text-xs font-medium">
                    {summary.activeGoalsCount}{' '}
                    {summary.activeGoalsCount === 1 ? 'Active Goal' : 'Active Goals'}
                  </Text>
                </>
              )}
            </View>

            <Text className="text-white text-[26px] font-extrabold tracking-tight mt-0.5">
              Savings Goals
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Turn your plans into progress.
            </Text>
          </View>

          {/* Quick Add Button in header: only visible when goals already exist */}
          {hasGoals && (
            <Button
              title="Add"
              size="sm"
              onPress={handleCreate}
              leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
            />
          )}
        </View>

        {/* Loading Indicator for first load */}
        {isLoadingSavings && savingsGoals.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 text-xs mt-3">
              Loading savings goals...
            </Text>
          </View>
        ) : !hasGoals ? (
          /* 2. Global Zero State (First time / empty state) */
          <SavingsEmptyState filterStatus="all" className="mt-2" />
        ) : (
          /* 3. Populated Content State */
          <View>
            {/* Summary Card */}
            <SavingsSummaryCard summary={summary} className="mb-4" />

            {/* Filter Segmented Control */}
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

            {/* Filtered Goals List or Filtered Empty State */}
            {filteredGoals.length === 0 ? (
              <SavingsEmptyState
                filterStatus={activeFilter}
                onClearFilter={() => setActiveFilter('all')}
              />
            ) : (
              <View className="gap-3.5">
                {filteredGoals.map((goal) => (
                  <SavingsGoalCard key={goal.id} goal={goal} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
