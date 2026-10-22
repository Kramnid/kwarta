import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import {
  formatTransactionDate,
  formatLocalDate,
  parseLocalDate,
  getTodayLocalDate,
} from '@/utils/date';

interface DatePickerModalProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  error?: string;
  className?: string;
}

export function DatePickerModal({
  value,
  onChange,
  error,
  className = '',
}: DatePickerModalProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Month currently being viewed in the calendar
  const initialDate = parseLocalDate(value || getTodayLocalDate());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const todayStr = getTodayLocalDate();
  const formattedDisplay = formatTransactionDate(value);

  const handleOpen = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    const cur = parseLocalDate(value || todayStr);
    setViewYear(cur.getFullYear());
    setViewMonth(cur.getMonth());
    setModalVisible(true);
  };

  const handleSelectDate = (dateStr: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onChange(dateStr);
    setModalVisible(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar calculations
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  // Convert to Monday = 0: (day + 6) % 7
  const startDayOffset = (firstDayOfWeek + 6) % 7;

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Quick selectors
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
        Date
      </Text>

      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <Card
          className={`flex-row items-center justify-between py-3.5 border ${
            error ? 'border-red-500/80' : 'border-slate-700/60'
          }`}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3 border border-slate-700/60">
              <CalendarIcon size={18} color="#10B981" />
            </View>
            <View>
              <Text className="text-white text-base font-semibold">
                {formattedDisplay || 'Select Date'}
              </Text>
              <Text className="text-slate-400 text-xs">{value}</Text>
            </View>
          </View>

          <View className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Text className="text-emerald-400 text-xs font-semibold">Change</Text>
          </View>
        </Card>
      </Pressable>

      {error ? (
        <Text className="text-red-400 text-xs mt-1.5 font-medium">{error}</Text>
      ) : null}

      {/* Date Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#0B1220]/95 justify-end">
          <View className="bg-[#151F30] rounded-t-3xl border-t border-slate-700/80 p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
              <Text className="text-white text-lg font-bold">Select Date</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Quick Select Buttons */}
            <View className="flex-row gap-3 mb-5">
              <Pressable
                onPress={() => handleSelectDate(todayStr)}
                className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                  value === todayStr
                    ? 'bg-emerald-500/20 border-emerald-500/60'
                    : 'bg-slate-800 border-slate-700/60 active:bg-slate-700'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    value === todayStr ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelectDate(yesterdayStr)}
                className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                  value === yesterdayStr
                    ? 'bg-emerald-500/20 border-emerald-500/60'
                    : 'bg-slate-800 border-slate-700/60 active:bg-slate-700'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    value === yesterdayStr ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  Yesterday
                </Text>
              </Pressable>
            </View>

            {/* Calendar Month Navigation */}
            <View className="flex-row items-center justify-between mb-4 px-2">
              <Pressable
                onPress={handlePrevMonth}
                hitSlop={8}
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
              >
                <ChevronLeft size={20} color="#F8FAFC" />
              </Pressable>

              <Text className="text-white font-bold text-base">{monthName}</Text>

              <Pressable
                onPress={handleNextMonth}
                hitSlop={8}
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
              >
                <ChevronRight size={20} color="#F8FAFC" />
              </Pressable>
            </View>

            {/* Weekday Labels (Mo - Su) */}
            <View className="flex-row justify-between mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <Text
                  key={d}
                  className="w-10 text-center text-slate-400 text-xs font-semibold"
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View className="flex-row flex-wrap justify-start">
              {daysArray.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <View key={`blank-${idx}`} className="w-[14.28%] h-10" />;
                }

                const dayDate = new Date(viewYear, viewMonth, dayNum);
                const dayDateStr = formatLocalDate(dayDate);
                const isSelected = value === dayDateStr;
                const isToday = todayStr === dayDateStr;

                return (
                  <View
                    key={`day-${dayNum}`}
                    className="w-[14.28%] h-10 items-center justify-center"
                  >
                    <Pressable
                      onPress={() => handleSelectDate(dayDateStr)}
                      className={`w-9 h-9 rounded-full items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500'
                          : isToday
                          ? 'border border-emerald-500/60'
                          : 'active:bg-slate-800'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-white'
                            : isToday
                            ? 'text-emerald-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {dayNum}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
