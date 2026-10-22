import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AnalyticsDateRangeOption, DateRange } from '@/types/analytics';
import {
  getTodayLocalDate,
  formatLocalDate,
  parseLocalDate,
} from '@/utils/date';
import { countDaysBetween, formatRangeLabel } from '@/utils/analytics';

export interface DateRangeSelectorProps {
  selectedOption: AnalyticsDateRangeOption;
  onSelectOption: (option: AnalyticsDateRangeOption) => void;
  customStartDate: string;
  customEndDate: string;
  onSetCustomRange: (startDate: string, endDate: string) => void;
  activeRange?: DateRange;
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
  activeRange,
}: DateRangeSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const todayStr = getTodayLocalDate();

  const [modalStart, setModalStart] = useState(customStartDate || todayStr);
  const [modalEnd, setModalEnd] = useState(customEndDate || todayStr);
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  // Month currently viewed in the calendar
  const initialDate = parseLocalDate(customStartDate || todayStr);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const handleChipPress = (key: AnalyticsDateRangeOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }

    if (key === 'custom') {
      const start = customStartDate || todayStr;
      const end = customEndDate || todayStr;
      setModalStart(start);
      setModalEnd(end);
      const startObj = parseLocalDate(start);
      setViewYear(startObj.getFullYear());
      setViewMonth(startObj.getMonth());
      setActiveTab('start');
      setIsModalVisible(true);
    } else {
      onSelectOption(key);
    }
  };

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectCalendarDay = (dateStr: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (activeTab === 'start') {
      setModalStart(dateStr);
      if (dateStr > modalEnd) {
        setModalEnd(dateStr);
      }
      setActiveTab('end');
    } else {
      if (dateStr < modalStart) {
        setModalStart(dateStr);
        setModalEnd(dateStr);
      } else {
        setModalEnd(dateStr);
      }
    }
  };

  const handleQuickShortcut = (days: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (days - 1));
    const startStr = formatLocalDate(dateObj);
    setModalStart(startStr);
    setModalEnd(todayStr);

    const startObj = parseLocalDate(startStr);
    setViewYear(startObj.getFullYear());
    setViewMonth(startObj.getMonth());
  };

  const handleMonthShortcut = (offsetMonth: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offsetMonth, 1);
    const firstDay = new Date(target.getFullYear(), target.getMonth(), 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);

    const startStr = formatLocalDate(firstDay);
    const endStr = formatLocalDate(lastDay);
    setModalStart(startStr);
    setModalEnd(endStr);
    setViewYear(firstDay.getFullYear());
    setViewMonth(firstDay.getMonth());
  };

  const handleApplyCustomRange = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    let finalStart = modalStart;
    let finalEnd = modalEnd;
    if (finalStart > finalEnd) {
      finalStart = modalEnd;
      finalEnd = modalStart;
    }

    onSetCustomRange(finalStart, finalEnd);
    setIsModalVisible(false);
  };

  // Calendar calculations
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const startDayOffset = (firstDayOfWeek + 6) % 7; // Monday = 0

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Days count for modal preview
  const previewDaysCount =
    modalStart && modalEnd
      ? countDaysBetween(
          modalStart <= modalEnd ? modalStart : modalEnd,
          modalStart <= modalEnd ? modalEnd : modalStart
        )
      : 1;

  // Format chip label for custom
  const getCustomChipLabel = () => {
    if (selectedOption === 'custom' && customStartDate && customEndDate) {
      return `Custom (${formatRangeLabel(customStartDate, customEndDate)})`;
    }
    return 'Custom Range';
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
          const displayLabel = item.key === 'custom' ? getCustomChipLabel() : item.label;

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
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={{
                  color: isActive ? '#0B1220' : '#E2E8F0',
                  fontWeight: isActive ? '700' : '500',
                }}
                className="text-xs"
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active Range Summary Subtitle */}
      {activeRange && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingHorizontal: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <CalendarDays size={13} color="#10B981" style={{ marginRight: 6 }} />
            <Text
              style={{ color: '#94A3B8', fontSize: 12, fontWeight: '500' }}
              numberOfLines={1}
            >
              Period:{' '}
              <Text style={{ color: '#F1F5F9', fontWeight: '700' }}>
                {activeRange.label}
              </Text>
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#1E293B',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '700' }}>
              {countDaysBetween(activeRange.startDate, activeRange.endDate)}{' '}
              {countDaysBetween(activeRange.startDate, activeRange.endDate) === 1
                ? 'day'
                : 'days'}
            </Text>
          </View>
        </View>
      )}

      {/* Custom Date Range Modal Bottom Sheet */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#0B1220]/95 justify-end">
          <View className="bg-[#151F30] rounded-t-3xl border-t border-slate-700/80 p-5 max-h-[92%]">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-700/60 mb-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Calendar size={18} color="#10B981" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Select Custom Range</Text>
                  <Text className="text-slate-400 text-[11px]">
                    Tap start & end dates on the calendar
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                hitSlop={8}
                className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
              >
                <X size={16} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Quick Preset Buttons */}
              <View className="mb-4">
                <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
                  Quick Shortcuts
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {[
                    { label: 'Last 7 Days', action: () => handleQuickShortcut(7) },
                    { label: 'Last 14 Days', action: () => handleQuickShortcut(14) },
                    { label: 'Last 30 Days', action: () => handleQuickShortcut(30) },
                    { label: 'Last 90 Days', action: () => handleQuickShortcut(90) },
                    { label: 'This Month', action: () => handleMonthShortcut(0) },
                    { label: 'Last Month', action: () => handleMonthShortcut(-1) },
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={preset.action}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: '#1E293B',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#334155',
                        marginRight: 6,
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '600' }}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Start & End Selector Tabs */}
              <View className="flex-row items-center gap-2 mb-4">
                <Pressable
                  onPress={() => {
                    setActiveTab('start');
                    const s = parseLocalDate(modalStart);
                    setViewYear(s.getFullYear());
                    setViewMonth(s.getMonth());
                  }}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: activeTab === 'start' ? '#10B981' : '#334155',
                    backgroundColor: activeTab === 'start' ? 'rgba(16, 185, 129, 0.1)' : '#1E293B',
                  }}
                >
                  <Text
                    style={{
                      color: activeTab === 'start' ? '#34D399' : '#94A3B8',
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    Start Date
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                    {formatRangeLabel(modalStart, modalStart)}
                  </Text>
                </Pressable>

                <View className="items-center justify-center px-1">
                  <ArrowRight size={14} color="#64748B" />
                </View>

                <Pressable
                  onPress={() => {
                    setActiveTab('end');
                    const e = parseLocalDate(modalEnd);
                    setViewYear(e.getFullYear());
                    setViewMonth(e.getMonth());
                  }}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: activeTab === 'end' ? '#10B981' : '#334155',
                    backgroundColor: activeTab === 'end' ? 'rgba(16, 185, 129, 0.1)' : '#1E293B',
                  }}
                >
                  <Text
                    style={{
                      color: activeTab === 'end' ? '#34D399' : '#94A3B8',
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    End Date
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                    {formatRangeLabel(modalEnd, modalEnd)}
                  </Text>
                </Pressable>
              </View>

              {/* Calendar Month Navigation */}
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Pressable
                  onPress={handlePrevMonth}
                  hitSlop={8}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: '#1E293B',
                    borderWidth: 1,
                    borderColor: '#334155',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={18} color="#F8FAFC" />
                </Pressable>

                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                  {monthName}
                </Text>

                <Pressable
                  onPress={handleNextMonth}
                  hitSlop={8}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: '#1E293B',
                    borderWidth: 1,
                    borderColor: '#334155',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={18} color="#F8FAFC" />
                </Pressable>
              </View>

              {/* Weekday Labels (Mo - Su) */}
              <View className="flex-row justify-between mb-1.5">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                  <Text
                    key={d}
                    style={{
                      width: '14.28%',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View className="flex-row flex-wrap justify-start mb-4">
                {daysArray.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <View key={`blank-${idx}`} className="w-[14.28%] h-9" />;
                  }

                  const dayDate = new Date(viewYear, viewMonth, dayNum);
                  const dayDateStr = formatLocalDate(dayDate);

                  const isStart = dayDateStr === modalStart;
                  const isEnd = dayDateStr === modalEnd;
                  const isEndpoint = isStart || isEnd;

                  const effectiveStart = modalStart <= modalEnd ? modalStart : modalEnd;
                  const effectiveEnd = modalStart <= modalEnd ? modalEnd : modalStart;
                  const isInRange = dayDateStr >= effectiveStart && dayDateStr <= effectiveEnd;
                  const isToday = dayDateStr === todayStr;

                  return (
                    <View
                      key={`day-${dayNum}`}
                      style={{
                        width: '14.28%',
                        height: 38,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          isInRange && !isEndpoint ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        borderTopLeftRadius: isStart ? 19 : 0,
                        borderBottomLeftRadius: isStart ? 19 : 0,
                        borderTopRightRadius: isEnd ? 19 : 0,
                        borderBottomRightRadius: isEnd ? 19 : 0,
                      }}
                    >
                      <Pressable
                        onPress={() => handleSelectCalendarDay(dayDateStr)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isEndpoint ? '#10B981' : 'transparent',
                          borderWidth: isToday && !isEndpoint ? 1 : 0,
                          borderColor: '#10B981',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isEndpoint ? '800' : isInRange ? '700' : '500',
                            color: isEndpoint
                              ? '#0B1220'
                              : isInRange
                              ? '#34D399'
                              : isToday
                              ? '#10B981'
                              : '#E2E8F0',
                          }}
                        >
                          {dayNum}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              {/* Selection Summary */}
              <View
                style={{
                  backgroundColor: '#1E293B',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                    Selected Range
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 1 }}>
                    {formatRangeLabel(modalStart, modalEnd)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderWidth: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '700' }}>
                    {previewDaysCount} {previewDaysCount === 1 ? 'day' : 'days'}
                  </Text>
                </View>
              </View>

              {/* Modal Actions */}
              <View className="flex-row gap-3 mb-2">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: '#1E293B',
                    borderWidth: 1,
                    borderColor: '#334155',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#E2E8F0', fontWeight: '600', fontSize: 13 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleApplyCustomRange}
                  activeOpacity={0.7}
                  style={{
                    flex: 1.4,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: '#10B981',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={16} color="#0B1220" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#0B1220', fontWeight: '800', fontSize: 13 }}>
                    Apply Range
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
