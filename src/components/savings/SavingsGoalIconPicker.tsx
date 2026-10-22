import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SAVINGS_ICONS } from '@/utils/savings';
import { SavingsGoalIcon } from './SavingsGoalIcon';

interface SavingsGoalIconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (iconId: string) => void;
  className?: string;
}

export function SavingsGoalIconPicker({
  selectedIcon,
  selectedColor,
  onSelectIcon,
  className = '',
}: SavingsGoalIconPickerProps) {
  const handleSelect = (iconId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onSelectIcon(iconId);
  };

  return (
    <View className={className}>
      <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
        Choose Goal Icon
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
      >
        {SAVINGS_ICONS.map((item) => {
          const isSelected = selectedIcon === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              className={`items-center px-3 py-2.5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500/70 shadow-sm'
                  : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800/50'
              }`}
            >
              <View
                style={{
                  backgroundColor: isSelected
                    ? `${selectedColor}26`
                    : 'rgba(148, 163, 184, 0.1)',
                }}
                className="w-10 h-10 rounded-xl items-center justify-center mb-1.5"
              >
                <SavingsGoalIcon
                  name={item.id}
                  color={isSelected ? selectedColor : '#94A3B8'}
                  size={19}
                  strokeWidth={isSelected ? 2.4 : 2}
                />
              </View>

              <Text
                numberOfLines={1}
                className={`text-[11px] max-w-[70px] text-center ${
                  isSelected ? 'text-white font-bold' : 'text-slate-400'
                }`}
              >
                {item.label.split('/')[0].trim()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default SavingsGoalIconPicker;
