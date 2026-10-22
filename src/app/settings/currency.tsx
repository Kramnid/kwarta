import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Coins, Calendar, Check, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store';
import { DateFormatOption } from '@/types/settings';
import { getTodayLocalDate, formatDisplayDate } from '@/utils/date';

export default function CurrencySettingsScreen() {
  const router = useRouter();
  const { dateFormat, updateDateFormat } = useSettingsStore();

  const todayStr = getTodayLocalDate();

  const handleSelectFormat = async (format: DateFormatOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await updateDateFormat(format);
  };

  const dateFormatOptions: { id: DateFormatOption; label: string; sample: string }[] = [
    {
      id: 'DD/MM/YYYY',
      label: 'Day / Month / Year',
      sample: formatDisplayDate(todayStr, 'DD/MM/YYYY'),
    },
    {
      id: 'MM/DD/YYYY',
      label: 'Month / Day / Year',
      sample: formatDisplayDate(todayStr, 'MM/DD/YYYY'),
    },
    {
      id: 'YYYY-MM-DD',
      label: 'Year - Month - Day (ISO)',
      sample: formatDisplayDate(todayStr, 'YYYY-MM-DD'),
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
            Currency & Dates
          </Text>
          <Text className="text-slate-400 text-xs">
            Financial unit & date format
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Currency Section */}
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">
          Active Currency
        </Text>

        <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 shadow-sm mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 items-center justify-center mr-3 shadow-sm">
                <Coins size={22} color="#FBBF24" />
              </View>

              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  Philippine Peso (PHP) — ₱
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Centavo integer accounting (1 PHP = 100 centavos)
                </Text>
              </View>
            </View>

            <View className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
              <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Active
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Date Format Section */}
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">
          Date Display Format
        </Text>

        <View className="bg-[#151F30] rounded-2xl border border-slate-700/60 overflow-hidden shadow-sm mb-5">
          {dateFormatOptions.map((opt, index) => {
            const isSelected = dateFormat === opt.id;
            const isLast = index === dateFormatOptions.length - 1;

            return (
              <Pressable
                key={opt.id}
                onPress={() => handleSelectFormat(opt.id)}
                className={`p-4 flex-row items-center justify-between active:bg-slate-800/60 ${
                  !isLast ? 'border-b border-slate-800/80' : ''
                }`}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center mr-3">
                    <Calendar size={18} color="#10B981" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">
                      {opt.id}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      Sample: <Text className="text-slate-200 font-medium">{opt.sample}</Text>
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

        {/* Explainer Note */}
        <View className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl flex-row items-start">
          <Info size={18} color="#94A3B8" style={{ marginTop: 2, marginRight: 10 }} />
          <Text className="text-slate-400 text-xs leading-5 flex-1">
            Changing your date display format adjusts how dates are rendered throughout the app. Stored timestamps in SQLite remain in standard ISO format, preserving data integrity.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
