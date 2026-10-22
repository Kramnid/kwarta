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
import { SummaryCard } from '@/components/dashboard/SummaryCard';
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
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingTransactions}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        ListHeaderComponent={
          <View className="mb-2">
            {/* 1. Header Bar matching DashboardHeader styling */}
            <View className="flex-row items-center justify-between mb-5 pt-1">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                    ACTIVITY & LOGS
                  </Text>
                  <Text className="text-slate-600 text-xs mx-1.5">•</Text>
                  <Text className="text-emerald-400 text-xs font-medium">
                    {transactions.length} Total
                  </Text>
                </View>

                <Text className="text-white text-[26px] font-extrabold tracking-tight mt-0.5">
                  Transactions
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Track and organize every peso.
                </Text>
              </View>

              <Button
                title="Add"
                size="sm"
                onPress={() => router.push('/add-transaction')}
                leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
              />
            </View>

            {/* 2. Overview / Filtered Summary Cards (matching dashboard SummaryCard) */}
            {filteredTransactions.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2.5 px-0.5">
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      {isFilterActive ? 'Filtered Results' : 'Period Overview'}
                    </Text>
                    {isFilterActive && (
                      <View className="ml-2 w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </View>

                  <View className="bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                    <Text className="text-slate-300 text-[11px] font-semibold">
                      {filteredTransactions.length}{' '}
                      {filteredTransactions.length === 1
                        ? 'transaction'
                        : 'transactions'}
                    </Text>
                  </View>
                </View>

                <SummaryCard
                  incomeCentavos={filteredIncome}
                  expenseCentavos={filteredExpenses}
                />
              </View>
            )}

            {/* 3. Search, Filter, and Sort Controls */}
            <TransactionFilters
              filters={filters}
              onChangeFilters={setFilters}
              categories={categories}
              className="mb-1"
            />
          </View>
        }
        renderSectionHeader={({ section: { title, totalIncome, totalExpenses } }) => (
          <View className="bg-[#0B1220] pt-4 pb-2.5 px-0.5 flex-row items-center justify-between">
            <Text className="text-slate-300 text-xs font-bold uppercase tracking-wider">
              {title}
            </Text>
            <View className="flex-row items-center gap-2">
              {totalIncome > 0 && (
                <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Text className="text-emerald-400 text-[11px] font-semibold">
                    +{formatCentavosToPhp(totalIncome)}
                  </Text>
                </View>
              )}
              {totalExpenses > 0 && (
                <View className="bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                  <Text className="text-slate-300 text-[11px] font-medium">
                    -{formatCentavosToPhp(totalExpenses)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const isOnly = isFirst && isLast;

          let containerClass =
            'bg-[#151F30] border-x border-slate-700/60 px-1 shadow-sm';
          if (isOnly) {
            containerClass =
              'bg-[#151F30] rounded-2xl border border-slate-700/60 px-1 py-1 mb-3.5 shadow-sm';
          } else if (isFirst) {
            containerClass =
              'bg-[#151F30] rounded-t-2xl border-t border-x border-slate-700/60 px-1 pt-1 shadow-sm';
          } else if (isLast) {
            containerClass =
              'bg-[#151F30] rounded-b-2xl border-b border-x border-slate-700/60 px-1 pb-1 mb-3.5 shadow-sm';
          }

          return (
            <View className={containerClass}>
              <TransactionListItem
                transaction={item}
                showDivider={!isLast}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          isLoadingTransactions && transactions.length === 0 ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-slate-400 text-xs mt-3">
                Loading transactions...
              </Text>
            </View>
          ) : (
            <TransactionEmptyState
              isFiltered={!hasNoTransactionsAtAll}
              onClearFilters={resetFilters}
              className="mt-2"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

