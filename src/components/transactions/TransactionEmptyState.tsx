import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, SearchX, PlusCircle, FilterX } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface TransactionEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export function TransactionEmptyState({
  isFiltered = false,
  onClearFilters,
  className = '',
}: TransactionEmptyStateProps) {
  const router = useRouter();

  if (isFiltered) {
    return (
      <View
        className={`py-12 px-6 items-center justify-center bg-[#151F30] rounded-3xl border border-slate-700/60 shadow-sm ${className}`}
      >
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center border border-slate-700/80 mb-3.5">
          <SearchX size={30} color="#94A3B8" />
        </View>

        <Text className="text-white text-lg font-bold text-center mb-1">
          No matching transactions
        </Text>

        <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-5 mb-5">
          Try changing your search keywords or adjusting your type, category, or
          date filters.
        </Text>

        {onClearFilters && (
          <Button
            title="Clear Filters"
            variant="outline"
            size="sm"
            onPress={onClearFilters}
            leftIcon={<FilterX size={16} color="#10B981" className="mr-1.5" />}
          />
        )}
      </View>
    );
  }

  return (
    <View
      className={`py-14 px-6 items-center justify-center bg-[#151F30] rounded-3xl border border-slate-700/60 shadow-sm ${className}`}
    >
      <View className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 items-center justify-center mb-4">
        <Receipt size={32} color="#10B981" />
      </View>

      <Text className="text-white text-xl font-bold text-center mb-1.5">
        No transactions yet
      </Text>

      <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-5 mb-6">
        Start tracking your money by adding your first income or expense
        transaction.
      </Text>

      <Button
        title="Add First Transaction"
        size="md"
        onPress={() => router.push('/add-transaction')}
        leftIcon={<PlusCircle size={18} color="#FFFFFF" className="mr-2" />}
      />
    </View>
  );
}
