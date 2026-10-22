import React from 'react';
import { View, Text } from 'react-native';
import { PiggyBank, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';

interface SavingsEmptyStateProps {
  filterStatus?: string;
  className?: string;
}

export function SavingsEmptyState({
  filterStatus = 'all',
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

  return (
    <View
      className={`bg-[#151F30] rounded-3xl p-8 border border-slate-700/60 items-center justify-center text-center shadow-sm ${className}`}
    >
      <View className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-4 shadow-sm">
        <PiggyBank size={30} color="#10B981" strokeWidth={2.2} />
      </View>

      <Text className="text-white text-lg font-bold text-center">
        {isFiltered
          ? `No ${filterStatus} savings goals`
          : 'No savings goals yet'}
      </Text>

      <Text className="text-slate-400 text-xs text-center mt-1.5 mb-6 max-w-[260px] leading-relaxed">
        {isFiltered
          ? `You have no goals marked as ${filterStatus}. Switch filters or create a new goal.`
          : 'Create your first goal and start working toward something meaningful.'}
      </Text>

      <Button
        title="Create Goal"
        onPress={handleCreate}
        leftIcon={<Plus size={16} color="#FFFFFF" strokeWidth={2.5} />}
        className="bg-emerald-600 px-6 py-3"
      />
    </View>
  );
}

export default SavingsEmptyState;
