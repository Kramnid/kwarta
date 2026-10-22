import React from 'react';
import { View, Text } from 'react-native';
import { PiggyBank, Target, CheckCircle2 } from 'lucide-react-native';
import { SavingsSummary } from '@/types/savings';
import { formatCentavosToPhp } from '@/utils/currency';
import { SavingsProgressBar } from './SavingsProgressBar';

interface SavingsSummaryCardProps {
  summary: SavingsSummary;
  className?: string;
}

export function SavingsSummaryCard({
  summary,
  className = '',
}: SavingsSummaryCardProps) {
  const formattedAllocated = formatCentavosToPhp(summary.totalAllocatedCentavos);
  const formattedTarget = formatCentavosToPhp(summary.totalTargetCentavos);

  return (
    <View
      className={`bg-[#151F30] rounded-3xl p-5 border border-slate-700/60 shadow-lg ${className}`}
    >
      {/* Top Banner: Icon & Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-3 shadow-sm">
            <PiggyBank size={20} color="#10B981" strokeWidth={2.3} />
          </View>
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Allocated to Goals
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight mt-0.5">
              {formattedAllocated}
            </Text>
          </View>
        </View>

        {/* Overall Progress Badge */}
        <View className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full items-center">
          <Text className="text-emerald-400 text-xs font-black">
            {`${summary.overallProgressPercentage.toFixed(1)}%`}
          </Text>
        </View>
      </View>

      {/* Overall Progress Bar */}
      <View className="mb-4">
        <SavingsProgressBar
          progressPercentage={summary.overallProgressPercentage}
          cappedPercentage={Math.min(100, summary.overallProgressPercentage)}
          color="#10B981"
          height={8}
        />
      </View>

      {/* Bottom Grid: Total Target & Goal Counts */}
      <View className="flex-row items-center justify-between pt-3 border-t border-slate-800/90">
        {/* Total Target */}
        <View className="flex-row items-center">
          <Target size={14} color="#94A3B8" />
          <View className="ml-2">
            <Text className="text-slate-500 text-[10px] font-bold uppercase">
              Total Target
            </Text>
            <Text className="text-slate-200 text-xs font-bold">
              {formattedTarget}
            </Text>
          </View>
        </View>

        {/* Active Goals */}
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
          <View>
            <Text className="text-slate-500 text-[10px] font-bold uppercase">
              Active Goals
            </Text>
            <Text className="text-slate-200 text-xs font-bold">
              {summary.activeGoalsCount}
            </Text>
          </View>
        </View>

        {/* Completed Goals */}
        <View className="flex-row items-center">
          <CheckCircle2 size={13} color="#34D399" />
          <View className="ml-1.5">
            <Text className="text-slate-500 text-[10px] font-bold uppercase">
              Completed
            </Text>
            <Text className="text-emerald-400 text-xs font-bold">
              {summary.completedGoalsCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default SavingsSummaryCard;
