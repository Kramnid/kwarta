import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, PlusCircle } from 'lucide-react-native';
import { Transaction } from '@/types/finance';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { TransactionItem } from './TransactionItem';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onTransactionPress?: (tx: Transaction) => void;
  className?: string;
}

export function RecentTransactions({
  transactions,
  onTransactionPress,
  className = '',
}: RecentTransactionsProps) {
  const router = useRouter();

  const handleSeeAll = () => {
    router.push('/(tabs)/transactions');
  };

  const handleAddTransaction = () => {
    router.push('/add-transaction');
  };

  // Limit to maximum 5 recent transactions on dashboard
  const displayTransactions = transactions.slice(0, 5);

  return (
    <View className={`mb-6 ${className}`}>
      <SectionHeader
        title="Recent Transactions"
        actionText="See All →"
        onActionPress={handleSeeAll}
      />

      <View className="bg-[#151F30] rounded-2xl p-2 border border-slate-700/60 shadow-sm">
        {displayTransactions.length === 0 ? (
          /* Empty State */
          <View className="py-8 px-4 items-center justify-center">
            <View className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 items-center justify-center mb-3">
              <Receipt size={28} color="#94A3B8" />
            </View>

            <Text className="text-white text-base font-bold text-center mb-1">
              No transactions yet
            </Text>
            <Text className="text-slate-400 text-xs text-center max-w-[240px] leading-4 mb-4">
              Start tracking your money by adding your first transaction.
            </Text>

            <Button
              title="Add Transaction"
              size="sm"
              onPress={handleAddTransaction}
              leftIcon={<PlusCircle size={16} color="#FFFFFF" />}
            />
          </View>
        ) : (
          /* Transactions List */
          <View>
            {displayTransactions.map((tx, index) => (
              <TransactionItem
                key={`recent-tx-${tx.id}-${index}`}
                transaction={tx}
                onPress={onTransactionPress}
                showDivider={index < displayTransactions.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
