import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, Plus, AlertCircle, RefreshCw } from 'lucide-react-native';

interface InsightsEmptyStateProps {
  type?: 'no_transactions' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}

export function InsightsEmptyState({
  type = 'no_transactions',
  errorMessage,
  onRetry,
}: InsightsEmptyStateProps) {
  if (type === 'error') {
    return (
      <View className="bg-[#151F30] rounded-2xl p-6 border border-rose-500/30 items-center justify-center my-6">
        <View className="w-12 h-12 rounded-full bg-rose-500/10 items-center justify-center mb-3">
          <AlertCircle size={24} color="#F87171" />
        </View>
        <Text className="text-white font-bold text-base text-center">
          Failed to Load Analytics
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1.5 mb-4 max-w-xs leading-4">
          {errorMessage || 'An error occurred while calculating analytics from SQLite.'}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="flex-row items-center bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700"
          >
            <RefreshCw size={14} color="#F8FAFC" className="mr-2" />
            <Text className="text-white font-bold text-xs ml-1.5">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="bg-[#151F30] rounded-2xl p-6 border border-slate-700/60 items-center justify-center my-6">
      <View className="w-14 h-14 rounded-full bg-emerald-500/10 items-center justify-center mb-3.5">
        <Sparkles size={28} color="#10B981" />
      </View>
      <Text className="text-white font-bold text-lg text-center">
        No insights yet
      </Text>
      <Text className="text-slate-400 text-xs text-center mt-1.5 mb-5 max-w-xs leading-5">
        Add your first transaction to start understanding your spending, savings rate, and category trends.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/add-transaction')}
        activeOpacity={0.8}
        className="flex-row items-center bg-emerald-500 px-5 py-3 rounded-xl shadow-md shadow-emerald-500/20"
      >
        <Plus size={16} color="#0B1220" />
        <Text className="text-[#0B1220] font-bold text-xs ml-1.5">
          Add Transaction
        </Text>
      </TouchableOpacity>
    </View>
  );
}
