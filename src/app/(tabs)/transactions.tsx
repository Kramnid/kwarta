import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useAppStore } from '@/store';
import {
  filterTransactions,
  groupTransactionsByDate,
  calculateTotalIncome,
  calculateTotalExpenses,
} from '@/utils/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionListItem } from '@/components/transactions/TransactionListItem';
import { TransactionEmptyState } from '@/components/transactions/TransactionEmptyState';
import { Button } from '@/components/ui/Button';

export default function TransactionsScreen() {
  const router = useRouter();
  const {
    transactions,
    categories,
    filters,
    setFilters,
    resetFilters,
    refreshTransactions,
    isLoadingTransactions,
  } = useAppStore();

  const handleRefresh = useCallback(async () => {
    await refreshTransactions();
  }, [refreshTransactions]);

  // 1. Filter and sort transactions based on active filter state
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  // 2. Group filtered transactions by local calendar date
  const groupedSections = useMemo(() => {
    const groups = groupTransactionsByDate(filteredTransactions);
    return groups.map((g) => ({
      date: g.date,
      title: g.title,
      totalIncome: g.totalIncomeCentavos,
      totalExpenses: g.totalExpensesCentavos,
      data: g.transactions,
    }));
  }, [filteredTransactions]);

  // 3. Compact filtered summary totals
  const filteredIncome = useMemo(
    () => calculateTotalIncome(filteredTransactions),
    [filteredTransactions]
  );
  const filteredExpenses = useMemo(
    () => calculateTotalExpenses(filteredTransactions),
    [filteredTransactions]
  );

  const isFilterActive =
    Boolean(filters.searchQuery) ||
    (filters.type && filters.type !== 'all') ||
    (filters.categoryId && filters.categoryId !== 'all') ||
    (filters.dateFilter && filters.dateFilter !== 'all');

  const hasNoTransactionsAtAll = transactions.length === 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      <View className="flex-1 px-5 pt-3">
        {/* Header Bar */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-white text-2xl font-bold tracking-tight">
              Transactions
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Track where your money goes.
            </Text>
          </View>

          <Button
            title="Add"
            size="sm"
            onPress={() => router.push('/add-transaction')}
            leftIcon={<Plus size={16} color="#FFFFFF" className="mr-1" />}
          />
        </View>

        {/* Search, Filter, and Sort Controls */}
        <TransactionFilters
          filters={filters}
          onChangeFilters={setFilters}
          categories={categories}
        />

        {/* Filtered Summary Card */}
        {filteredTransactions.length > 0 && (
          <View className="flex-row items-center justify-between bg-[#151F30] px-4 py-2.5 rounded-2xl border border-slate-700/60 mb-3">
            <View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                {isFilterActive ? 'FILTERED RESULTS' : 'TOTAL COUNT'}
              </Text>
              <Text className="text-slate-300 text-xs font-semibold mt-0.5">
                {filteredTransactions.length}{' '}
                {filteredTransactions.length === 1
                  ? 'transaction'
                  : 'transactions'}
              </Text>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="items-end">
                <Text className="text-slate-500 text-[10px] font-semibold uppercase">
                  Income
                </Text>
                <Text className="text-emerald-400 text-xs font-bold mt-0.5">
                  +{formatCentavosToPhp(filteredIncome)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-slate-500 text-[10px] font-semibold uppercase">
                  Expenses
                </Text>
                <Text className="text-rose-400 text-xs font-bold mt-0.5">
                  -{formatCentavosToPhp(filteredExpenses)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Transactions List */}
        {isLoadingTransactions && transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 text-xs mt-3">
              Loading transactions...
            </Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <TransactionEmptyState
            isFiltered={!hasNoTransactionsAtAll}
            onClearFilters={resetFilters}
            className="mt-4"
          />
        ) : (
          <SectionList
            sections={groupedSections}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index, section }) => (
              <View className="bg-[#151F30] mx-0.5 px-1 border-x border-slate-700/60">
                <TransactionListItem
                  transaction={item}
                  showDivider={index < section.data.length - 1}
                />
              </View>
            )}
            renderSectionHeader={({ section: { title, totalIncome, totalExpenses } }) => (
              <View className="bg-[#0B1220] pt-4 pb-2 px-1 flex-row items-center justify-between">
                <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                  {title}
                </Text>
                <View className="flex-row items-center gap-2">
                  {totalIncome > 0 && (
                    <Text className="text-emerald-400 text-[11px] font-semibold">
                      +{formatCentavosToPhp(totalIncome)}
                    </Text>
                  )}
                  {totalExpenses > 0 && (
                    <Text className="text-slate-400 text-[11px] font-medium">
                      -{formatCentavosToPhp(totalExpenses)}
                    </Text>
                  )}
                </View>
              </View>
            )}
            renderSectionFooter={() => (
              <View className="h-2 bg-[#151F30] rounded-b-2xl border-b border-x border-slate-700/60 mb-2" />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingTransactions}
                onRefresh={handleRefresh}
                tintColor="#10B981"
                colors={['#10B981']}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
