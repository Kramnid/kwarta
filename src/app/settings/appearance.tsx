import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Smartphone, Check, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store';
import { AppearanceMode } from '@/types/settings';

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const { appearance, updateAppearance } = useSettingsStore();

  const handleSelect = async (mode: AppearanceMode) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await updateAppearance(mode);
  };

  const options: { id: AppearanceMode; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'dark',
      title: 'Dark Mode (Recommended)',
      subtitle: 'Kwarta signature sleek emerald & slate fintech theme',
      icon: <Moon size={20} color="#10B981" />,
    },
    {
      id: 'system',
      title: 'System Default',
      subtitle: 'Follow device system appearance setting',
      icon: <Smartphone size={20} color="#38BDF8" />,
    },
    {
      id: 'light',
      title: 'Light Mode (Experimental)',
      subtitle: 'Light interface for high ambient lighting environments',
      icon: <Sun size={20} color="#FBBF24" />,
    },
  ];

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
            Appearance
          </Text>
          <Text className="text-slate-400 text-xs">
            Theme and visual styling
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-1">
          Select Theme
        </Text>

        <View className="bg-[#151F30] rounded-2xl border border-slate-700/60 overflow-hidden shadow-sm mb-5">
          {options.map((opt, index) => {
            const isSelected = appearance === opt.id;
            const isLast = index === options.length - 1;

            return (
              <Pressable
                key={opt.id}
                onPress={() => handleSelect(opt.id)}
                className={`p-4 flex-row items-center justify-between active:bg-slate-800/60 ${
                  !isLast ? 'border-b border-slate-800/80' : ''
                }`}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center mr-3 shadow-sm">
                    {opt.icon}
                  </View>

                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">
                      {opt.title}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5 leading-4">
                      {opt.subtitle}
                    </Text>
                  </View>
                </View>

                <View
                  className={`w-6 h-6 rounded-full border items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 shadow-sm'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Theme Information Banner */}
        <View className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl flex-row items-start">
          <Info size={18} color="#94A3B8" style={{ marginTop: 2, marginRight: 10 }} />
          <Text className="text-slate-400 text-xs leading-5 flex-1">
            Kwarta is crafted around a high-contrast dark fintech palette designed for OLED screens and power efficiency. Your theme preference is preserved across app sessions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
