import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatGreeting } from '@/utils/date';
import { useAppStore } from '@/store';

interface DashboardHeaderProps {
  userName?: string;
  className?: string;
}

export function DashboardHeader({
  userName,
  className = '',
}: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = formatGreeting();
  const { isDemoMode, toggleDemoMode } = useAppStore();

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleAvatarPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    router.push('/(tabs)/settings');
  };

  const handleDemoPillPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }
    toggleDemoMode();
  };

  return (
    <View className={`flex-row items-center justify-between mb-5 pt-1 ${className}`}>
      {/* Left side: Greeting, Date & Title */}
      <View className="flex-1 mr-3">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
            {greeting}
            {userName ? `, ${userName}` : ''}
          </Text>

          <Text className="text-slate-600 text-xs mx-1.5">•</Text>

          <Text className="text-emerald-400 text-xs font-medium">
            {todayDisplay}
          </Text>

          {/* Sample Preview Badge */}
          {isDemoMode && (
            <Pressable
              onPress={handleDemoPillPress}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              className="ml-2 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-row items-center active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Sample data active, tap to switch"
            >
              <Sparkles size={10} color="#10B981" />
              <Text className="text-emerald-400 text-[10px] font-bold tracking-wide ml-1">
                SAMPLE
              </Text>
            </Pressable>
          )}
        </View>

        <Text className="text-white text-[26px] font-extrabold tracking-tight mt-0.5">
          My Overview
        </Text>
        <Text className="text-slate-400 text-xs mt-0.5">
          {"Here's your personal financial snapshot."}
        </Text>
      </View>

      {/* Right side: Circular Avatar / Settings shortcut with active indicator */}
      <Pressable
        onPress={handleAvatarPress}
        accessibilityRole="button"
        accessibilityLabel="Go to Settings"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700/80 items-center justify-center active:bg-slate-700 active:border-emerald-500/40 shadow-sm relative transition-all"
      >
        <View className="w-10 h-10 rounded-full bg-[#151F30] items-center justify-center">
          <User size={19} color="#10B981" />
        </View>
        {/* Subtle active status indicator dot */}
        <View className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B1220]" />
      </Pressable>
    </View>
  );
}
