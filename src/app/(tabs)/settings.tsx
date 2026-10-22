import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Settings, Shield, Coins, Database, Moon, Info } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center py-6">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center border border-slate-700/80 mb-3">
          <Settings size={30} color="#10B981" />
        </View>

        <Text className="text-white text-xl font-bold">Settings & System Info</Text>
        <Text className="text-slate-400 text-xs mt-1">
          Kwarta v1.0.0 • Every peso counts.
        </Text>
      </View>

      {/* App Configuration Overview */}
      <Card className="mb-4">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
          Core Configuration
        </Text>

        <View className="space-y-4">
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-700/50">
            <View className="flex-row items-center">
              <Coins size={18} color="#10B981" />
              <Text className="text-slate-200 text-sm font-medium ml-3">Currency</Text>
            </View>
            <Text className="text-emerald-400 font-semibold text-sm">PHP (₱)</Text>
          </View>

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-700/50">
            <View className="flex-row items-center">
              <Database size={18} color="#10B981" />
              <Text className="text-slate-200 text-sm font-medium ml-3">Database</Text>
            </View>
            <Text className="text-slate-400 text-sm">kwarta.db (WAL Mode)</Text>
          </View>

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-700/50">
            <View className="flex-row items-center">
              <Moon size={18} color="#10B981" />
              <Text className="text-slate-200 text-sm font-medium ml-3">Theme</Text>
            </View>
            <Text className="text-slate-400 text-sm">Fintech Dark</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Shield size={18} color="#10B981" />
              <Text className="text-slate-200 text-sm font-medium ml-3">Privacy</Text>
            </View>
            <Text className="text-emerald-400 text-sm font-medium">100% Offline</Text>
          </View>
        </View>
      </Card>

      <Card elevated>
        <View className="flex-row items-center mb-2">
          <Info size={16} color="#94A3B8" />
          <Text className="text-slate-300 font-semibold text-sm ml-2">
            Step 1 Setup Completed
          </Text>
        </View>
        <Text className="text-slate-400 text-xs leading-5">
          Data export, backup/restore, category customization, and currency preferences will be implemented in upcoming steps.
        </Text>
      </Card>
    </ScrollView>
  );
}
