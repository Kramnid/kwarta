import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, Plus, Receipt } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TransactionsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center py-8">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center border border-slate-700/80 mb-4">
          <Receipt size={32} color="#10B981" />
        </View>

        <Text className="text-white text-xl font-bold text-center">
          Transactions History
        </Text>
        <Text className="text-slate-400 text-sm text-center mt-2 px-6 leading-5">
          View, search, and filter your incoming salary and daily expenses.
        </Text>
      </View>

      <Card className="mb-6">
        <View className="flex-row items-center mb-3">
          <ArrowLeftRight size={18} color="#10B981" />
          <Text className="text-white font-semibold text-base ml-2">
            Step 1 Placeholder
          </Text>
        </View>
        <Text className="text-slate-400 text-xs leading-5">
          The SQLite schema for <Text className="text-emerald-400">transactions</Text> and{' '}
          <Text className="text-emerald-400">categories</Text> is prepared and seeded. Full transaction CRUD, filtering by date, and category tags will be integrated in subsequent steps.
        </Text>
      </Card>

      <Button
        title="Record New Transaction"
        onPress={() => router.push('/add-transaction')}
        leftIcon={<Plus size={18} color="#FFFFFF" />}
      />
    </ScrollView>
  );
}
