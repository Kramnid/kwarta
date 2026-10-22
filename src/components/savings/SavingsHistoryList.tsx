import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SavingsEntry } from '@/types/savings';
import { formatCentavosToPhp } from '@/utils/currency';
import { formatDeadline } from '@/utils/savings';

interface SavingsHistoryListProps {
  entries: SavingsEntry[];
  onDeleteEntry?: (entryId: string) => void;
  className?: string;
}

export function SavingsHistoryList({
  entries,
  onDeleteEntry,
  className = '',
}: SavingsHistoryListProps) {
  if (entries.length === 0) {
    return (
      <View className={`bg-[#151F30] rounded-2xl p-6 border border-slate-700/60 items-center justify-center ${className}`}>
        <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center mb-3">
          <ArrowUp size={20} color="#94A3B8" />
        </View>
        <Text className="text-white text-base font-bold">No activity yet</Text>
        <Text className="text-slate-400 text-xs text-center mt-1 max-w-[240px]">
          Add money to this goal to start tracking your savings progress.
        </Text>
      </View>
    );
  }

  return (
    <View className={`bg-[#151F30] rounded-2xl border border-slate-700/60 overflow-hidden ${className}`}>
      {entries.map((entry, index) => {
        const isContribution = entry.type === 'contribution';
        const formattedAmount = formatCentavosToPhp(entry.amount_centavos);
        const formattedDate = formatDeadline(entry.entry_date) || entry.entry_date;
        const isLast = index === entries.length - 1;

        return (
          <View key={entry.id}>
            <View className="flex-row items-center justify-between p-4 active:bg-slate-800/40">
              {/* Left: Icon & Description */}
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center mr-3 border ${
                    isContribution
                      ? 'bg-emerald-500/15 border-emerald-500/30'
                      : 'bg-rose-500/15 border-rose-500/30'
                  }`}
                >
                  {isContribution ? (
                    <ArrowUp size={16} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <ArrowDown size={16} color="#F87171" strokeWidth={2.5} />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold">
                    {isContribution ? 'Added to Goal' : 'Withdrawn from Goal'}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {formattedDate}
                  </Text>
                  {entry.note ? (
                    <Text
                      numberOfLines={2}
                      className="text-slate-500 text-xs mt-0.5 italic"
                    >
                      &ldquo;{entry.note}&rdquo;
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Right: Amount & Delete Action */}
              <View className="items-end">
                <Text
                  className={`text-sm font-bold tracking-tight ${
                    isContribution ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isContribution
                    ? `+${formattedAmount}`
                    : `-${formattedAmount}`}
                </Text>

                {onDeleteEntry && (
                  <Pressable
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      onDeleteEntry(entry.id);
                    }}
                    className="p-1 mt-1 opacity-60 active:opacity-100"
                    accessibilityRole="button"
                    accessibilityLabel="Delete entry"
                  >
                    <Trash2 size={13} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            </View>

            {!isLast && (
              <View className="h-[1px] bg-slate-800/80 mx-4" />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default SavingsHistoryList;
