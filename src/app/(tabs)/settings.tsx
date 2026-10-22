import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Settings, Shield, Coins, Database, Moon, Sparkles } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store';

export default function SettingsScreen() {
  const { isDemoMode, toggleDemoMode, isDatabaseReady, dbError } = useAppStore();

  return (
    <ScrollView
      className="flex-1 bg-[#0B1220]"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center py-6">
        <View className="w-16 h-16 rounded-3xl bg-slate-800 items-center justify-center border border-slate-700/80 mb-3">
          <Settings size={30} color="#10B981" />
        </View>

        <Text className="text-white text-xl font-bold">Settings & Preferences</Text>
        <Text className="text-slate-400 text-xs mt-1">
          Kwarta v1.0.0 • Every peso counts.
        </Text>
      </View>

      {/* Demo Mode Toggle Card */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-3">
              <Sparkles size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold">Sample Data</Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Show example transactions to explore features
              </Text>
            </View>
          </View>

          <Switch
            value={isDemoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: '#334155', true: '#059669' }}
            thumbColor={isDemoMode ? '#10B981' : '#94A3B8'}
          />
        </View>
      </Card>

      {/* App Configuration Overview */}
      <Card className="mb-4">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
          Preferences & Storage
        </Text>

        <View className="gap-4">
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
              <Text className="text-slate-200 text-sm font-medium ml-3">Storage</Text>
            </View>
            <Text className="text-slate-400 text-sm">
              {isDatabaseReady ? 'Saved on Device' : dbError ? 'Unavailable' : 'Connecting...'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-700/50">
            <View className="flex-row items-center">
              <Moon size={18} color="#10B981" />
              <Text className="text-slate-200 text-sm font-medium ml-3">Theme</Text>
            </View>
            <Text className="text-slate-400 text-sm">Dark Mode</Text>
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
    </ScrollView>
  );
}
