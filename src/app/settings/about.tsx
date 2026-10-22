import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Coins,
  Shield,
  Cpu,
  Heart,
  ExternalLink,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { SettingsSection, SettingsRow } from '@/components/settings';

export default function AboutScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/Kramnid/kwarta');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center border-b border-slate-800/80">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-slate-800/80 items-center justify-center mr-3 active:bg-slate-700 border border-slate-700/60"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#F8FAFC" />
        </Pressable>

        <View className="flex-1">
          <Text className="text-white text-xl font-bold tracking-tight">
            About Kwarta
          </Text>
          <Text className="text-slate-400 text-xs">
            App details and architecture
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero App Banner */}
        <View className="items-center py-6 mb-3">
          <View className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-4 shadow-xl">
            <Coins size={38} color="#10B981" />
          </View>

          <Text className="text-white text-2xl font-black tracking-tight">Kwarta</Text>
          <Text className="text-emerald-400 text-sm font-bold tracking-wide mt-0.5">
            Every peso counts.
          </Text>

          <Text className="text-slate-400 text-xs text-center mt-3 max-w-[290px] leading-relaxed">
            Kwarta is an offline-first personal finance tracker that helps users monitor spending, manage budgets, and track savings goals.
          </Text>
        </View>

        {/* 1. App Build Information */}
        <SettingsSection title="Application Info">
          <SettingsRow
            icon={<Cpu size={18} color="#10B981" />}
            title="Version"
            subtitle="Current release version"
            value={`v${appVersion}`}
            showDivider
          />
          <SettingsRow
            icon={<Shield size={18} color="#38BDF8" />}
            iconBgColor="bg-sky-500/15 border-sky-500/30"
            title="Architecture"
            subtitle="Storage & State Engine"
            value="Offline SQLite + WAL"
            showDivider
          />
          <SettingsRow
            icon={<Coins size={18} color="#FBBF24" />}
            iconBgColor="bg-amber-500/15 border-amber-500/30"
            title="Currency Standard"
            subtitle="Philippine Peso integer centavos"
            value="PHP (₱)"
            showDivider={false}
          />
        </SettingsSection>

        {/* 2. Open Source & Project Credits */}
        <SettingsSection title="Open Source & Community">
          <SettingsRow
            icon={<ExternalLink size={18} color="#A78BFA" />}
            iconBgColor="bg-purple-500/15 border-purple-500/30"
            title="Source Code"
            subtitle="Inspect project repository on GitHub"
            onPress={handleOpenGitHub}
            showDivider
          />
          <SettingsRow
            icon={<Heart size={18} color="#F87171" />}
            iconBgColor="bg-rose-500/15 border-rose-500/30"
            title="Made for the Philippines"
            subtitle="Built with Expo SDK 56, React Native & Lucide Icons"
            showDivider={false}
          />
        </SettingsSection>

        <View className="items-center mt-4">
          <Text className="text-slate-500 text-xs text-center">
            Designed for privacy, speed, and financial peace of mind.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
