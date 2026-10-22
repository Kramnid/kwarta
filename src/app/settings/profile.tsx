import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store';
import { Button } from '@/components/ui/Button';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { displayName, profileInitials, updateProfile } = useSettingsStore();

  const [name, setName] = useState(displayName);
  const [initials, setInitials] = useState(profileInitials);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewInitials =
    initials.trim().toUpperCase() ||
    (name.trim()
      ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      : 'KW');

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      setErrorMessage('Display name cannot exceed 50 characters.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await updateProfile(trimmedName, initials.trim());
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert('Profile Updated', 'Your display name and initials have been saved locally.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
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
            My Profile
          </Text>
          <Text className="text-slate-400 text-xs">
            Personalize your local dashboard
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Live Preview */}
        <View className="items-center py-6 mb-4">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-[#151F30] border-2 border-emerald-500/40 items-center justify-center shadow-lg">
              <Text className="text-emerald-400 text-3xl font-black tracking-wider">
                {previewInitials}
              </Text>
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0B1220] items-center justify-center shadow-sm">
              <User size={13} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>

          <Text className="text-white text-lg font-bold mt-3">
            {name.trim() || 'No Name Set'}
          </Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            Local Device Profile
          </Text>
        </View>

        {/* Privacy Note */}
        <View className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-2xl flex-row items-start mb-5">
          <ShieldCheck size={18} color="#10B981" style={{ marginTop: 2, marginRight: 10 }} />
          <Text className="text-emerald-300 text-xs leading-5 flex-1">
            Kwarta does not require an online account or password. Your profile name and preferences are stored strictly on this device.
          </Text>
        </View>

        {/* Form Fields */}
        <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm mb-6">
          {/* Display Name Input */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Display Name
              </Text>
              <Text className="text-slate-500 text-[11px]">{name.length}/50</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={50}
              placeholder="e.g. Maria Santos, Alex"
              placeholderTextColor="#64748B"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-xl border border-slate-700 text-sm focus:border-emerald-500"
            />
            <Text className="text-slate-500 text-[11px] mt-1.5">
              Used in the dashboard greeting (e.g. &ldquo;Good morning, Maria&rdquo;).
            </Text>
          </View>

          {/* Profile Initials Input */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Custom Initials (Optional)
              </Text>
              <Text className="text-slate-500 text-[11px]">{initials.length}/4</Text>
            </View>
            <TextInput
              value={initials}
              onChangeText={(text) => {
                setInitials(text.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={4}
              autoCapitalize="characters"
              placeholder="e.g. MS"
              placeholderTextColor="#64748B"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-xl border border-slate-700 text-sm font-bold tracking-wider focus:border-emerald-500"
            />
            <Text className="text-slate-500 text-[11px] mt-1.5">
              Leave blank to automatically derive from your display name.
            </Text>
          </View>
        </View>

        {/* Error message */}
        {errorMessage && (
          <View className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl mb-4">
            <Text className="text-rose-400 text-xs font-medium">{errorMessage}</Text>
          </View>
        )}

        {/* Save Button */}
        <Button
          title="Save Profile"
          onPress={handleSave}
          loading={isSaving}
          size="md"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
