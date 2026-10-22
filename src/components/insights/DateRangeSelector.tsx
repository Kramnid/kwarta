import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar, Check, X, AlertCircle } from 'lucide-react-native';
import { AnalyticsDateRangeOption } from '@/types/analytics';
import { getTodayLocalDate } from '@/utils/date';

interface DateRangeSelectorProps {
  selectedOption: AnalyticsDateRangeOption;
  onSelectOption: (option: AnalyticsDateRangeOption) => void;
  customStartDate: string;
  customEndDate: string;
  onSetCustomRange: (startDate: string, endDate: string) => void;
}

const PRESETS: { key: AnalyticsDateRangeOption; label: string }[] = [
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'this_year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' },
];

export function DateRangeSelector({
  selectedOption,
  onSelectOption,
  customStartDate,
  customEndDate,
  onSetCustomRange,
}: DateRangeSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStart, setModalStart] = useState(customStartDate || getTodayLocalDate());
  const [modalEnd, setModalEnd] = useState(customEndDate || getTodayLocalDate());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChipPress = (key: AnalyticsDateRangeOption) => {
    if (key === 'custom') {
      setModalStart(customStartDate || getTodayLocalDate());
      setModalEnd(customEndDate || getTodayLocalDate());
      setValidationError(null);
      setIsModalVisible(true);
    } else {
      onSelectOption(key);
    }
  };

  const handleApplyCustomRange = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(modalStart)) {
      setValidationError('Start date must be formatted as YYYY-MM-DD');
      return;
    }
    if (!dateRegex.test(modalEnd)) {
      setValidationError('End date must be formatted as YYYY-MM-DD');
      return;
    }

    if (modalStart > modalEnd) {
      setValidationError('Start date cannot be after end date.');
      return;
    }

    setValidationError(null);
    onSetCustomRange(modalStart, modalEnd);
    setIsModalVisible(false);
  };

  return (
    <View className="mb-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        className="flex-row"
      >
        {PRESETS.map((item) => {
          const isActive = selectedOption === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleChipPress(item.key)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isActive ? '#10B981' : '#151F30',
                borderColor: isActive ? '#10B981' : '#334155',
              }}
              className="px-3.5 py-2 rounded-xl mr-2 border flex-row items-center shadow-sm"
            >
              {item.key === 'custom' && (
                <Calendar
                  size={13}
                  color={isActive ? '#0B1220' : '#94A3B8'}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text
                style={{
                  color: isActive ? '#0B1220' : '#E2E8F0',
                  fontWeight: isActive ? '700' : '500',
                }}
                className="text-xs"
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Custom Date Range Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/70 justify-center items-center px-5"
        >
          <View className="w-full max-w-sm bg-[#151F30] rounded-2xl p-5 border border-slate-700 shadow-xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <View className="flex-row items-center">
                <Calendar size={18} color="#10B981" />
                <Text className="text-white font-bold text-base ml-2">
                  Select Custom Range
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {validationError && (
              <View className="flex-row items-center bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl mb-4">
                <AlertCircle size={15} color="#F87171" />
                <Text className="text-rose-300 text-xs ml-2 flex-1">
                  {validationError}
                </Text>
              </View>
            )}

            {/* Quick Preset Buttons */}
            <View className="mb-4">
              <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                Quick Shortcuts
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {[
                  { label: 'Last 7 Days', days: 7 },
                  { label: 'Last 14 Days', days: 14 },
                  { label: 'Last 30 Days', days: 30 },
                  { label: 'Last 90 Days', days: 90 },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => {
                      const todayStr = getTodayLocalDate();
                      const dateObj = new Date();
                      dateObj.setDate(dateObj.getDate() - (preset.days - 1));
                      const year = dateObj.getFullYear();
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      setModalStart(`${year}-${month}-${day}`);
                      setModalEnd(todayStr);
                      setValidationError(null);
                    }}
                    className="bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 active:bg-slate-700"
                  >
                    <Text className="text-slate-300 text-[11px] font-medium">
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Date Input */}
            <View className="mb-3.5">
              <Text className="text-slate-400 text-xs font-semibold uppercase mb-1.5">
                Start Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={modalStart}
                onChangeText={setModalStart}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                className="bg-[#0B1220] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 font-mono text-sm"
                maxLength={10}
              />
            </View>

            {/* End Date Input */}
            <View className="mb-5">
              <Text className="text-slate-400 text-xs font-semibold uppercase mb-1.5">
                End Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={modalEnd}
                onChangeText={setModalEnd}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
                className="bg-[#0B1220] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 font-mono text-sm"
                maxLength={10}
              />
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
                className="flex-1 py-3 rounded-xl bg-slate-800 items-center"
              >
                <Text className="text-slate-300 font-semibold text-xs">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplyCustomRange}
                activeOpacity={0.7}
                className="flex-1 py-3 rounded-xl bg-emerald-500 items-center flex-row justify-center"
              >
                <Check size={16} color="#0B1220" />
                <Text className="text-[#0B1220] font-bold text-xs ml-1.5">
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
