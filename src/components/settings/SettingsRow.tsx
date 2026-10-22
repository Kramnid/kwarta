import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SettingsRowProps {
  icon?: React.ReactNode;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showDivider?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function SettingsRow({
  icon,
  iconBgColor = 'bg-emerald-500/15 border-emerald-500/30',
  title,
  subtitle,
  value,
  onPress,
  rightElement,
  showDivider = true,
  destructive = false,
  disabled = false,
  accessibilityLabel,
}: SettingsRowProps) {
  const handlePress = () => {
    if (disabled || !onPress) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const isInteractive = Boolean(onPress) && !disabled;

  return (
    <Pressable
      onPress={isInteractive ? handlePress : undefined}
      disabled={!isInteractive}
      className={`px-4 py-3.5 flex-row items-center justify-between ${
        isInteractive ? 'active:bg-slate-800/60' : ''
      } ${showDivider ? 'border-b border-slate-800/80' : ''}`}
      accessibilityRole={isInteractive ? 'button' : 'none'}
      accessibilityLabel={accessibilityLabel || title}
    >
      {/* Left Icon and Title/Subtitle */}
      <View className="flex-row items-center flex-1 mr-3">
        {icon && (
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 border ${iconBgColor}`}
          >
            {icon}
          </View>
        )}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className={`text-sm font-semibold tracking-tight ${
              destructive ? 'text-rose-400' : 'text-white'
            }`}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={2}
              className={`text-xs mt-0.5 leading-4 ${
                destructive ? 'text-rose-400/80' : 'text-slate-400'
              }`}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right Side: Value preview, custom element, or chevron */}
      <View className="flex-row items-center">
        {value ? (
          <Text className="text-slate-400 text-xs font-medium mr-2 max-w-[150px]" numberOfLines={1}>
            {value}
          </Text>
        ) : null}

        {rightElement ? (
          rightElement
        ) : isInteractive ? (
          <ChevronRight size={16} color="#64748B" />
        ) : null}
      </View>
    </Pressable>
  );
}

export default SettingsRow;
