import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import {
  Search,
  X,
  ArrowUpDown,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  TransactionFilters as ITransactionFilters,
  TransactionCategory,
  TransactionSortOption,
} from '@/types/finance';

interface TransactionFiltersProps {
  filters: ITransactionFilters;
  onChangeFilters: (filters: Partial<ITransactionFilters>) => void;
  categories: TransactionCategory[];
  className?: string;
}

const SORT_OPTIONS: { id: TransactionSortOption; label: string }[] = [
  { id: 'date_desc', label: 'Newest First' },
  { id: 'date_asc', label: 'Oldest First' },
  { id: 'amount_desc', label: 'Highest Amount' },
  { id: 'amount_asc', label: 'Lowest Amount' },
];

export function TransactionFilters({
  filters,
  onChangeFilters,
  categories,
  className = '',
}: TransactionFiltersProps) {
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const handleSearchChange = (text: string) => {
    onChangeFilters({ searchQuery: text });
  };

  const handleClearSearch = () => {
    onChangeFilters({ searchQuery: '' });
  };

  const handleTypeSelect = (type: 'all' | 'income' | 'expense') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onChangeFilters({ type, categoryId: 'all' });
  };

  const handleDateSelect = (
    dateFilter: 'all' | 'today' | 'this_week' | 'this_month'
  ) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onChangeFilters({ dateFilter });
  };

  const handleCategorySelect = (categoryId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onChangeFilters({ categoryId });
  };

  const handleSortSelect = (sortBy: TransactionSortOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onChangeFilters({ sortBy });
    setSortModalVisible(false);
  };

  // Filter categories to show in chip list based on selected type
  const availableCategories =
    filters.type && filters.type !== 'all'
      ? categories.filter((c) => c.type === filters.type)
      : categories;

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === (filters.sortBy || 'date_desc'))
      ?.label || 'Newest First';

  return (
    <View className={`mb-4 ${className}`}>
      {/* 1. Search Bar */}
      <View className="flex-row items-center bg-[#151F30] rounded-2xl px-3.5 py-1 border border-slate-700/60 mb-3">
        <Search size={18} color="#94A3B8" className="mr-2" />
        <TextInput
          value={filters.searchQuery || ''}
          onChangeText={handleSearchChange}
          placeholder="Search transactions by title or note..."
          placeholderTextColor="#64748B"
          className="flex-1 text-sm text-white py-2.5 font-medium"
        />
        {filters.searchQuery ? (
          <Pressable
            onPress={handleClearSearch}
            hitSlop={8}
            className="w-6 h-6 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
          >
            <X size={14} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      {/* 2. Type Chips & Sort Button Row */}
      <View className="flex-row items-center justify-between gap-2 mb-3">
        {/* Type Segment Chips */}
        <View className="flex-row bg-[#151F30] p-1 rounded-xl border border-slate-700/60 flex-1">
          {(['all', 'income', 'expense'] as const).map((t) => {
            const isSelected = (filters.type || 'all') === t;
            let label = 'All';
            if (t === 'income') label = 'Income';
            if (t === 'expense') label = 'Expenses';

            return (
              <Pressable
                key={t}
                onPress={() => handleTypeSelect(t)}
                className={`flex-1 py-1.5 rounded-lg items-center justify-center ${
                  isSelected ? 'bg-slate-800 shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected
                      ? t === 'income'
                        ? 'text-emerald-400'
                        : t === 'expense'
                        ? 'text-red-400'
                        : 'text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sort Modal Trigger */}
        <Pressable
          onPress={() => setSortModalVisible(true)}
          className="flex-row items-center bg-[#151F30] px-3 py-2 rounded-xl border border-slate-700/60 active:bg-slate-800"
        >
          <ArrowUpDown size={14} color="#10B981" />
          <Text className="text-slate-300 text-xs font-semibold ml-1.5">
            {currentSortLabel}
          </Text>
        </Pressable>
      </View>

      {/* 3. Date Range Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2.5 -mx-1 px-1"
      >
        <View className="flex-row gap-2">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
          ].map((d) => {
            const isSelected = (filters.dateFilter || 'all') === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() =>
                  handleDateSelect(
                    d.id as 'all' | 'today' | 'this_week' | 'this_month'
                  )
                }
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50'
                    : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 4. Category Filter Chips */}
      {availableCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-1 px-1"
        >
          <View className="flex-row gap-2 py-0.5">
            <Pressable
              onPress={() => handleCategorySelect('all')}
              className={`px-3 py-1.5 rounded-full border ${
                (filters.categoryId || 'all') === 'all'
                  ? 'bg-slate-700 border-slate-500'
                  : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  (filters.categoryId || 'all') === 'all'
                    ? 'text-white'
                    : 'text-slate-400'
                }`}
              >
                All Categories
              </Text>
            </Pressable>

            {availableCategories.map((c) => {
              const isSelected = filters.categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => handleCategorySelect(c.id)}
                  className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-slate-700 border-slate-400'
                      : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800'
                  }`}
                >
                  <View
                    style={{ backgroundColor: c.color }}
                    className="w-2 h-2 rounded-full mr-1.5"
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Sort Options Modal */}
      <Modal
        visible={sortModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          onPress={() => setSortModalVisible(false)}
          className="flex-1 bg-black/70 items-center justify-center p-6"
        >
          <View className="bg-[#151F30] rounded-3xl p-5 w-full max-w-xs border border-slate-700/80 shadow-2xl">
            <Text className="text-white font-bold text-base mb-3 pb-2 border-b border-slate-700/60">
              Sort Transactions
            </Text>

            <View className="gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected =
                  (filters.sortBy || 'date_desc') === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleSortSelect(opt.id)}
                    className={`flex-row items-center justify-between p-3 rounded-xl ${
                      isSelected
                        ? 'bg-slate-800 border border-emerald-500/50'
                        : 'active:bg-slate-800/50'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Check size={16} color="#10B981" strokeWidth={2.5} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
