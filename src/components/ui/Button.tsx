import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...rest
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Graceful fallback on web or unsupported devices
    }

    onPress?.();
  };

  // Base background & border colors
  let bgClass = 'bg-emerald-500 active:bg-emerald-600';
  let textClass = 'text-white font-semibold';
  let borderClass = '';

  if (variant === 'secondary') {
    bgClass = 'bg-slate-800 active:bg-slate-700';
    textClass = 'text-slate-100 font-semibold';
  } else if (variant === 'outline') {
    bgClass = 'bg-transparent active:bg-slate-800/50';
    textClass = 'text-emerald-400 font-semibold';
    borderClass = 'border border-slate-700';
  } else if (variant === 'ghost') {
    bgClass = 'bg-transparent active:bg-slate-800/30';
    textClass = 'text-slate-300 font-medium';
  }

  // Sizing
  let sizeClass = 'py-3.5 px-6 rounded-2xl';
  let textSizeClass = 'text-base';

  if (size === 'sm') {
    sizeClass = 'py-2 px-4 rounded-xl';
    textSizeClass = 'text-sm';
  } else if (size === 'lg') {
    sizeClass = 'py-4 px-8 rounded-2xl';
    textSizeClass = 'text-lg';
  }

  const disabledClass = disabled || loading ? 'opacity-50' : 'opacity-100';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${bgClass} ${sizeClass} ${borderClass} ${disabledClass}`}
      style={style}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            numberOfLines={1}
            className={`${textClass} ${textSizeClass} ${leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}`}
            style={textStyle}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}
