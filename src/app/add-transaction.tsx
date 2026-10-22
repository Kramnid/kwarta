import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AddTransactionModal() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View className="flex-1 bg-[#0B1220]">
      {/* Top Modal Navigation Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-[#151F30]">
        <Text className="text-white text-lg font-bold">New Transaction</Text>
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
          hitSlop={10}
        >
          <X size={18} color="#94A3B8" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Transaction Type Selector (Expense vs Income) */}
        <View className="flex-row bg-slate-800/80 p-1 rounded-2xl mb-6 border border-slate-700/60">
          <Pressable
            onPress={() => setType('expense')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              type === 'expense' ? 'bg-red-500/20 border border-red-500/40' : ''
            }`}
          >
            <ArrowDownCircle
              size={18}
              color={type === 'expense' ? '#F87171' : '#94A3B8'}
            />
            <Text
              className={`ml-2 font-semibold text-sm ${
                type === 'expense' ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              Expense
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setType('income')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              type === 'income' ? 'bg-emerald-500/20 border border-emerald-500/40' : ''
            }`}
          >
            <ArrowUpCircle
              size={18}
              color={type === 'income' ? '#10B981' : '#94A3B8'}
            />
            <Text
              className={`ml-2 font-semibold text-sm ${
                type === 'income' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount Input Card */}
        <Card className="mb-4">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Amount (PHP)
          </Text>
          <View className="flex-row items-center">
            <Text className="text-3xl font-extrabold text-emerald-400 mr-2">₱</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              className="flex-1 text-3xl font-bold text-white py-1"
            />
          </View>
        </Card>

        {/* Note / Description */}
        <Card className="mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Description / Note
          </Text>
          <TextInput
            placeholder="e.g. Grocery at SM Supermarket"
            placeholderTextColor="#475569"
            value={description}
            onChangeText={setDescription}
            className="text-base text-white py-1"
          />
        </Card>

        {/* Step 1 Foundation Notice */}
        <View className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-6">
          <Text className="text-xs text-slate-400 leading-5">
            <Text className="text-emerald-400 font-semibold">Foundation Ready:</Text> This modal route establishes the Expo Router modal navigation flow. Full database persistence (inserting transactions into SQLite in integer centavos) will be implemented in Step 2.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="Done (Close Modal)"
          onPress={() => router.back()}
          rightIcon={<Check size={18} color="#FFFFFF" className="ml-2" />}
        />
      </ScrollView>
    </View>
  );
}
