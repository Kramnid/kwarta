import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Receipt } from 'lucide-react-native';
import { useAppStore } from '@/store';
import { sortTransactionsByDate } from '@/utils/finance';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { Button } from '@/components/ui/Button';

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions } = useAppStore();
  const sortedTransactions = sortTransactionsByDate(transactions);

  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-white text-xl font-bold">All Transactions</Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            {sortedTransactions.length} recorded {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>

        <Button
          title="New"
          size="sm"
          onPress={() => router.push('/add-transaction')}
          leftIcon={<Plus size={16} color="#FFFFFF" />}
        />
      </View>

      {/* Transactions List */}
      <View className="bg-[#151F30] rounded-3xl p-3 border border-slate-700/60 shadow-sm mb-6">
        {sortedTransactions.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <View className="w-14 h-14 rounded-2xl bg-slate-800 items-center justify-center mb-3">
              <Receipt size={28} color="#94A3B8" />
            </View>
            <Text className="text-white text-base font-bold text-center">
              No transactions yet
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Start tracking by adding your first transaction.
            </Text>
          </View>
        ) : (
          sortedTransactions.map((tx, index) => (
            <TransactionItem
              key={`tx-history-${tx.id}-${index}`}
              transaction={tx}
              showDivider={index < sortedTransactions.length - 1}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
