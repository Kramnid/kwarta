import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  className = '',
}: SectionHeaderProps) {
  const handleAction = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onActionPress?.();
  };

  return (
    <View className={`flex-row items-center justify-between mb-3.5 ${className}`}>
      <View className="flex-1 mr-2">
        <Text className="text-white text-lg font-bold tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-slate-400 text-xs mt-0.5">{subtitle}</Text>
        )}
      </View>

      {actionText && onActionPress && (
        <Pressable
          onPress={handleAction}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          className="active:opacity-60 py-1"
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <Text className="text-emerald-400 text-sm font-semibold">
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
