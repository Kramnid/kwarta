import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle2, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SavingsGoal } from '@/types/savings';
import { formatCentavosToPhp } from '@/utils/currency';
import {
  calculateGoalProgress,
  formatDeadline,
  formatDaysRemainingText,
} from '@/utils/savings';
import { SavingsGoalIcon } from './SavingsGoalIcon';
import { SavingsProgressBar } from './SavingsProgressBar';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  className?: string;
}

export function SavingsGoalCard({ goal, className = '' }: SavingsGoalCardProps) {
  const router = useRouter();

  const progress = calculateGoalProgress(
    goal.target_centavos,
    goal.allocated_centavos
  );

  const formattedTarget = formatCentavosToPhp(goal.target_centavos);
  const formattedAllocated = formatCentavosToPhp(goal.allocated_centavos);
  const formattedRemaining = formatCentavosToPhp(progress.remainingCentavos);
  const formattedDate = formatDeadline(goal.deadline);
  const daysRemainingText = formatDaysRemainingText(goal.deadline);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push({
      pathname: '/savings/[id]',
      params: { id: goal.id },
    } as any);
  };

  const isCompleted = progress.isCompleted || goal.status === 'completed';
  const isArchived = goal.status === 'archived';

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${formattedAllocated} of ${formattedTarget}, ${progress.progressPercentage}% complete`}
      className={`bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 active:bg-slate-800/80 shadow-sm ${className}`}
    >
      {/* Top Row: Icon, Title, Status & Chevron */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          {/* Goal Icon Container with dynamic color tint */}
          <View
            style={{
              backgroundColor: `${goal.color}1F`,
              borderColor: `${goal.color}3D`,
            }}
            className="w-11 h-11 rounded-2xl items-center justify-center border mr-3 shadow-sm"
          >
            <SavingsGoalIcon
              name={goal.icon}
              color={goal.color}
              size={20}
              strokeWidth={2.2}
            />
          </View>

          {/* Goal Name & Subtitle */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                numberOfLines={1}
                className="text-white text-base font-bold tracking-tight flex-1"
              >
                {goal.name}
              </Text>
            </View>

            <View className="flex-row items-center mt-0.5">
              {isCompleted ? (
                <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full mr-2">
                  <CheckCircle2 size={11} color="#34D399" />
                  <Text className="text-emerald-300 text-[10px] font-bold ml-1 uppercase">
                    Target Reached
                  </Text>
                </View>
              ) : isArchived ? (
                <View className="bg-slate-700/40 border border-slate-600/30 px-2 py-0.5 rounded-full mr-2">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">
                    Archived
                  </Text>
                </View>
              ) : null}

              {formattedDate ? (
                <View className="flex-row items-center">
                  <Calendar size={11} color="#94A3B8" />
                  <Text className="text-slate-400 text-[11px] ml-1">
                    {formattedDate}
                  </Text>
                  {daysRemainingText && !isCompleted && !isArchived ? (
                    <Text className="text-slate-500 text-[11px] ml-1.5">
                      • {daysRemainingText}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="text-slate-400 text-[11px]">No deadline</Text>
              )}
            </View>
          </View>
        </View>

        <ChevronRight size={18} color="#64748B" />
      </View>

      {/* Financial Numbers Row */}
      <View className="flex-row items-baseline justify-between mb-2 pt-1">
        <View>
          <Text className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            Allocated
          </Text>
          <Text className="text-white text-lg font-black tracking-tight mt-0.5">
            {formattedAllocated}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            Target
          </Text>
          <Text className="text-slate-300 text-sm font-bold tracking-tight mt-0.5">
            {formattedTarget}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <SavingsProgressBar
        progressPercentage={progress.progressPercentage}
        cappedPercentage={progress.cappedPercentage}
        color={goal.color}
        height={7}
      />

      {/* Progress Info Footer */}
      <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-800/80">
        <Text className="text-slate-400 text-xs">
          {isCompleted ? (
            <Text className="text-emerald-400 font-semibold">Goal 100% Achieved!</Text>
          ) : (
            <>
              Remaining:{' '}
              <Text className="text-slate-200 font-semibold">
                {formattedRemaining}
              </Text>
            </>
          )}
        </Text>

        <Text
          style={{ color: isCompleted ? '#34D399' : goal.color }}
          className="text-xs font-black tracking-tight"
        >
          {`${progress.progressPercentage.toFixed(1)}%`}
        </Text>
      </View>
    </Pressable>
  );
}

export default SavingsGoalCard;
