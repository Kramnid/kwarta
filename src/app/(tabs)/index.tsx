import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Wallet,
  PlusCircle,
  Database,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { formatPhp } from '@/utils/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { isDatabaseReady, dbError } = useAppStore();

  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Welcome / Status Bar */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Welcome to Kwarta
          </Text>
          <Text className="text-white text-xl font-bold mt-0.5">
            Personal Dashboard
          </Text>
        </View>

        {/* Database Status Pill */}
        <View className="flex-row items-center bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
          <Database size={13} color={isDatabaseReady ? '#10B981' : '#FBBF24'} />
          <Text className="text-slate-300 text-xs font-medium ml-1.5">
            {isDatabaseReady ? 'SQLite Ready' : dbError ? 'DB Error' : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Main Balance Card */}
      <Card className="mb-6 relative overflow-hidden">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
            Total Balance
          </Text>
          <View className="bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <Text className="text-emerald-400 text-[10px] font-bold">PREVIEW</Text>
          </View>
        </View>

        <Text className="text-3xl font-extrabold text-white mb-4">
          {formatPhp(12500)}
        </Text>

        <View className="flex-row items-center justify-between pt-4 border-t border-slate-700/60">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-emerald-500/15 items-center justify-center mr-2.5">
              <TrendingUp size={16} color="#10B981" />
            </View>
            <View>
              <Text className="text-slate-400 text-[11px]">Income (Mo)</Text>
              <Text className="text-slate-200 text-sm font-semibold">
                {formatPhp(25000)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-red-500/15 items-center justify-center mr-2.5">
              <TrendingDown size={16} color="#F87171" />
            </View>
            <View>
              <Text className="text-slate-400 text-[11px]">Expenses (Mo)</Text>
              <Text className="text-slate-200 text-sm font-semibold">
                {formatPhp(12500)}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Action Shortcut to Modal */}
      <View className="mb-6">
        <Button
          title="Add Transaction"
          onPress={() => router.push('/add-transaction')}
          leftIcon={<PlusCircle size={20} color="#FFFFFF" />}
        />
      </View>

      {/* Foundation Status & Architecture Card */}
      <Card elevated className="mb-6">
        <View className="flex-row items-center mb-3">
          <CheckCircle2 size={18} color="#10B981" />
          <Text className="text-white font-bold text-base ml-2">
            Step 1: Foundation Established
          </Text>
        </View>
        <Text className="text-slate-400 text-xs leading-5 mb-3">
          The core architecture is fully initialized:
        </Text>
        <View className="space-y-2">
          <Text className="text-slate-300 text-xs">
            • <Text className="text-emerald-400 font-semibold">Expo Router:</Text> File-based navigation & tab layout
          </Text>
          <Text className="text-slate-300 text-xs">
            • <Text className="text-emerald-400 font-semibold">NativeWind v4:</Text> Dark mode fintech styling system
          </Text>
          <Text className="text-slate-300 text-xs">
            • <Text className="text-emerald-400 font-semibold">Expo SQLite:</Text> kwarta.db with WAL mode & migrations
          </Text>
          <Text className="text-slate-300 text-xs">
            • <Text className="text-emerald-400 font-semibold">Currency:</Text> Centavo-safe Philippine Peso (PHP / ₱)
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
