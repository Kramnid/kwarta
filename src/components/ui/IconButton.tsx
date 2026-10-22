import React from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'ghost' | 'emerald';
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  badge?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  accessibilityLabel,
  style,
  className = '',
  badge = false,
  ...props
}: IconButtonProps) {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onPress?.();
  };

  let sizeClasses = 'w-10 h-10 rounded-full';
  if (size === 'sm') sizeClasses = 'w-8 h-8 rounded-full';
  if (size === 'lg') sizeClasses = 'w-12 h-12 rounded-full';

  let variantClasses =
    'bg-slate-800/80 border border-slate-700/60 active:bg-slate-700';
  if (variant === 'elevated') {
    variantClasses =
      'bg-slate-800 border border-slate-600/80 shadow-md active:bg-slate-700';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent active:bg-slate-800/60';
  } else if (variant === 'emerald') {
    variantClasses =
      'bg-emerald-500/20 border border-emerald-500/40 active:bg-emerald-500/30';
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={`items-center justify-center relative ${sizeClasses} ${variantClasses} ${className}`}
      style={style}
      {...props}
    >
      {icon}
      {badge && (
        <View className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B1220]" />
      )}
    </Pressable>
  );
}
