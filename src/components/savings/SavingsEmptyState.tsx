import React from 'react';
import { View, Text } from 'react-native';
import { PiggyBank, Plus, Target, TrendingUp, ShieldCheck, FilterX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';

interface SavingsEmptyStateProps {
  filterStatus?: string;
  onClearFilter?: () => void;
  className?: string;
}

export function SavingsEmptyState({
  filterStatus = 'all',
  onClearFilter,
  className = '',
}: SavingsEmptyStateProps) {
  const router = useRouter();

  const handleCreate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push('/savings/create' as any);
  };

  const isFiltered = filterStatus !== 'all';

  // 1. Filtered empty state (e.g. user selected "completed" or "archived" but has none)
  if (isFiltered) {
    const filterLabel =
      filterStatus === 'completed'
        ? 'completed'
        : filterStatus === 'archived'
        ? 'archived'
        : filterStatus;

    return (
      <View
        className={`bg-[#151F30] rounded-3xl p-8 border border-slate-700/60 items-center justify-center text-center shadow-sm ${className}`}
      >
        <View className="w-16 h-16 rounded-3xl bg-slate-800/90 border border-slate-700 items-center justify-center mb-4">
          <FilterX size={28} color="#94A3B8" />
        </View>

        <Text className="text-white text-lg font-bold text-center">
          No {filterLabel} savings goals
        </Text>

        <Text className="text-slate-400 text-xs text-center mt-1.5 mb-6 max-w-[260px] leading-relaxed">
          {filterStatus === 'completed'
            ? 'Goals you fully fund (100% target reached) will be displayed here.'
            : filterStatus === 'archived'
            ? 'Goals you choose to archive will be preserved here for your records.'
            : `You have no goals currently marked as ${filterLabel}.`}
        </Text>

        <View className="flex-row items-center gap-3">
          {onClearFilter && (
            <Button
              title="Show All Goals"
              variant="outline"
              size="sm"
              onPress={onClearFilter}
            />
          )}
          <Button
            title="Create Goal"
            size="sm"
            onPress={handleCreate}
            leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
          />
        </View>
      </View>
    );
  }

  // 2. Global Zero State (First-time user onboarding view)
  return (
    <View
      className={`bg-[#151F30] rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-lg ${className}`}
    >
      {/* Visual glowing icon center */}
      <View className="items-center mb-5">
        <View className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 items-center justify-center shadow-sm">
          <View className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
            <PiggyBank size={30} color="#10B981" strokeWidth={2.2} />
          </View>
        </View>

        <Text className="text-white text-xl font-extrabold text-center tracking-tight mt-4">
          No Savings Goals Yet
        </Text>

        <Text className="text-slate-400 text-xs text-center mt-1.5 max-w-[280px] leading-relaxed">
          Start saving with purpose. Set targets for vacations, gadgets, emergency funds, or big life milestones.
        </Text>
      </View>

      {/* Feature highlights grid */}
      <View className="gap-2.5 mb-6">
        <View className="flex-row items-center bg-[#0B1220]/70 p-3 rounded-2xl border border-slate-800/80">
          <View className="w-8 h-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
            <Target size={16} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">Custom Targets</Text>
            <Text className="text-slate-400 text-[11px]">
              Set amounts, target dates, custom colors, and icons.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-[#0B1220]/70 p-3 rounded-2xl border border-slate-800/80">
          <View className="w-8 h-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
            <TrendingUp size={16} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">Milestone Progress</Text>
            <Text className="text-slate-400 text-[11px]">
              Visual progress bars and percent completion as you deposit.
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-[#0B1220]/70 p-3 rounded-2xl border border-slate-800/80">
          <View className="w-8 h-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
            <ShieldCheck size={16} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">Dedicated Funds</Text>
            <Text className="text-slate-400 text-[11px]">
              Allocated money stays separated without distorting daily expenses.
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Call to Action */}
      <Button
        title="Create Your First Goal"
        size="md"
        onPress={handleCreate}
        leftIcon={<Plus size={18} color="#FFFFFF" strokeWidth={2.5} />}
      />
    </View>
  );
}

export default SavingsEmptyState;
