import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  elevated?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  elevated = false,
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const bgClass = elevated ? 'bg-slate-800' : 'bg-[#151F30]';

  return (
    <View
      className={`${bgClass} rounded-2xl p-5 border border-slate-700/60 shadow-sm ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
