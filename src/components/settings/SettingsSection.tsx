import React from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <View className={`mb-5 ${className}`}>
      {title ? (
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">
          {title}
        </Text>
      ) : null}
      <View className="bg-[#151F30] rounded-2xl border border-slate-700/60 overflow-hidden shadow-sm">
        {children}
      </View>
    </View>
  );
}

export default SettingsSection;
