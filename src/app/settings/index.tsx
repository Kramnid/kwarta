import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Moon,
  Coins,
  Tags,
  Database,
  Shield,
  Info,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useAppStore, useSettingsStore } from '@/store';
import { SettingsSection, SettingsRow } from '@/components/settings';

export default function SettingsMainScreen() {
  const router = useRouter();
  const { isDemoMode, toggleDemoMode } = useAppStore();
  const {
    displayName,
    appearance,
    dateFormat,
    isAppLockEnabled,
  } = useSettingsStore();

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const appearanceLabel =
    appearance === 'light'
      ? 'Light Mode'
      : appearance === 'system'
      ? 'System Default'
      : 'Dark Mode';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Top Navigation Header */}
      <View className="px-5 py-3 flex-row items-center border-b border-slate-800/80">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-2xl bg-slate-800/80 items-center justify-center mr-3 active:bg-slate-700 border border-slate-700/60"
          accessibilityRole="button"
          accessibilityLabel="Go back to Home"
        >
          <ArrowLeft size={18} color="#F8FAFC" />
        </Pressable>

        <View className="flex-1">
          <Text className="text-white text-xl font-bold tracking-tight">
            Settings
          </Text>
          <Text className="text-slate-400 text-xs">
            Make Kwarta yours.
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Personalization Section */}
        <SettingsSection title="Personalization">
          <SettingsRow
            icon={<User size={18} color="#10B981" />}
            title="My Profile"
            subtitle={displayName ? `Displaying as ${displayName}` : 'Set display name and avatar initials'}
            value={displayName || 'Not Set'}
            onPress={() => router.push('/settings/profile' as any)}
            showDivider
          />
          <SettingsRow
            icon={<Moon size={18} color="#38BDF8" />}
            iconBgColor="bg-sky-500/15 border-sky-500/30"
            title="Appearance"
            subtitle="Theme and visual preferences"
            value={appearanceLabel}
            onPress={() => router.push('/settings/appearance' as any)}
            showDivider
          />
          <SettingsRow
            icon={<Coins size={18} color="#FBBF24" />}
            iconBgColor="bg-amber-500/15 border-amber-500/30"
            title="Currency & Date Format"
            subtitle={`PHP (₱) • ${dateFormat}`}
            value={dateFormat}
            onPress={() => router.push('/settings/currency' as any)}
            showDivider={false}
          />
        </SettingsSection>

        {/* 2. Money Management Section */}
        <SettingsSection title="Money Management">
          <SettingsRow
            icon={<Tags size={18} color="#A78BFA" />}
            iconBgColor="bg-purple-500/15 border-purple-500/30"
            title="Manage Categories"
            subtitle="Customize income and expense categories, icons & colors"
            onPress={() => router.push('/settings/categories' as any)}
            showDivider={false}
          />
        </SettingsSection>

        {/* 3. Data Management Section */}
        <SettingsSection title="Data Management">
          <SettingsRow
            icon={<Database size={18} color="#10B981" />}
            iconBgColor="bg-emerald-500/15 border-emerald-500/30"
            title="Backup & Restore"
            subtitle="CSV export, offline JSON backups, and full database restore"
            onPress={() => router.push('/settings/backup' as any)}
            showDivider={false}
          />
        </SettingsSection>

        {/* 4. Privacy & Security Section */}
        <SettingsSection title="Privacy & Security">
          <SettingsRow
            icon={<Shield size={18} color="#34D399" />}
            iconBgColor="bg-emerald-500/15 border-emerald-500/30"
            title="Privacy Information & App Lock"
            subtitle="100% offline data guarantees and device biometrics"
            value={isAppLockEnabled ? 'Lock Active' : 'Offline'}
            onPress={() => router.push('/settings/privacy' as any)}
            showDivider={false}
          />
        </SettingsSection>

        {/* 5. Demo / Sample Data Switch */}
        <SettingsSection title="Testing & Demo">
          <SettingsRow
            icon={<Sparkles size={18} color="#F59E0B" />}
            iconBgColor="bg-amber-500/15 border-amber-500/30"
            title="Sample Demo Data"
            subtitle="Explore features with simulated transactions"
            rightElement={
              <Switch
                value={isDemoMode}
                onValueChange={toggleDemoMode}
                trackColor={{ false: '#334155', true: '#059669' }}
                thumbColor={isDemoMode ? '#10B981' : '#94A3B8'}
              />
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* 6. About Section */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<Info size={18} color="#94A3B8" />}
            iconBgColor="bg-slate-700/40 border-slate-700/60"
            title="About Kwarta"
            subtitle="Every peso counts. Offline-first personal finance tracker."
            value={`v${appVersion}`}
            onPress={() => router.push('/settings/about' as any)}
            showDivider={false}
          />
        </SettingsSection>

        {/* Footer info */}
        <View className="items-center mt-3 mb-6">
          <Text className="text-slate-500 text-xs">
            Kwarta v{appVersion} • All data stays on this device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
