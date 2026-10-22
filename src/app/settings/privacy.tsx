import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  CloudOff,
  Fingerprint,
  FileText,
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store';
import { SettingsSection, SettingsRow } from '@/components/settings';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { isAppLockEnabled, updateAppLock } = useSettingsStore();

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometrics');

  useEffect(() => {
    async function checkBiometrics() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(hasHardware && isEnrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID / Biometrics');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        }
      } catch {
        setIsBiometricSupported(false);
      }
    }
    checkBiometrics();
  }, []);

  const handleToggleAppLock = async (enable: boolean) => {
    if (!isBiometricSupported) {
      Alert.alert(
        'Device Security Unavailable',
        'Biometric authentication or device PIN is not configured on this device.'
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: enable
          ? 'Authenticate to enable Kwarta App Lock'
          : 'Authenticate to disable Kwarta App Lock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        await updateAppLock(enable);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      } else {
        Alert.alert('Authentication Failed', 'Could not verify your identity. App Lock setting remains unchanged.');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Authentication Error', msg);
    }
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
            Privacy & Security
          </Text>
          <Text className="text-slate-400 text-xs">
            Data sovereignty & protection
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Privacy Seal */}
        <View className="items-center py-5 mb-3">
          <View className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-3 shadow-sm">
            <ShieldCheck size={32} color="#10B981" />
          </View>
          <Text className="text-white text-xl font-bold">100% Offline by Design</Text>
          <Text className="text-slate-400 text-xs text-center mt-1 max-w-[280px]">
            Your money data belongs exclusively to you and never touches a third-party server.
          </Text>
        </View>

        {/* 1. App Lock Section */}
        <SettingsSection title="Device Access Protection">
          <SettingsRow
            icon={<Fingerprint size={18} color="#10B981" />}
            title="Biometric App Lock"
            subtitle={
              isBiometricSupported
                ? `Require ${biometricType} or device passcode to unlock`
                : 'Biometrics / PIN not available on this device'
            }
            rightElement={
              <Switch
                value={isAppLockEnabled}
                onValueChange={handleToggleAppLock}
                disabled={!isBiometricSupported}
                trackColor={{ false: '#334155', true: '#059669' }}
                thumbColor={isAppLockEnabled ? '#10B981' : '#94A3B8'}
              />
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* Security Limitation Notice */}
        <View className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl flex-row items-start mb-5">
          <Lock size={16} color="#94A3B8" style={{ marginTop: 2, marginRight: 10 }} />
          <Text className="text-slate-400 text-xs leading-5 flex-1">
            <Text className="text-slate-200 font-bold">Security Transparency:</Text> App Lock provides a biometric barrier on the device UI. It does not encrypt the underlying SQLite database file. Users should protect their physical device with a strong passcode.
          </Text>
        </View>

        {/* 2. Privacy Architecture Principles */}
        <SettingsSection title="Privacy Architecture">
          <SettingsRow
            icon={<CloudOff size={18} color="#38BDF8" />}
            iconBgColor="bg-sky-500/15 border-sky-500/30"
            title="Zero Cloud Storage"
            subtitle="Transactions and balances are stored only in local SQLite on your phone."
            showDivider
          />

          <SettingsRow
            icon={<Database size={18} color="#A78BFA" />}
            iconBgColor="bg-purple-500/15 border-purple-500/30"
            title="No Account Required"
            subtitle="No sign-up, no email collection, no passwords, and zero tracking analytics."
            showDivider
          />

          <SettingsRow
            icon={<FileText size={18} color="#FBBF24" />}
            iconBgColor="bg-amber-500/15 border-amber-500/30"
            title="Local Backups"
            subtitle="When you export CSVs or JSON backups, you choose where to save or share them."
            showDivider={false}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
