import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DestructiveActionDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmPhrase?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DestructiveActionDialogContent({
  title,
  message,
  confirmText = 'Confirm',
  confirmPhrase,
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: Omit<DestructiveActionDialogProps, 'visible'>) {
  const [typedPhrase, setTypedPhrase] = useState('');

  const isConfirmed = confirmPhrase
    ? typedPhrase.trim().toUpperCase() === confirmPhrase.toUpperCase()
    : true;

  const handleConfirm = () => {
    if (!isConfirmed || isLoading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    onConfirm();
  };

  const handleCancel = () => {
    if (isLoading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onCancel();
  };

  return (
    <View className="flex-1 bg-black/75 items-center justify-center p-5">
      <View className="bg-[#151F30] rounded-3xl p-6 w-full max-w-sm border border-slate-700/80 shadow-2xl">
        {/* Warning Icon Badge */}
        <View className="items-center mb-4">
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center border shadow-sm ${
              isDestructive
                ? 'bg-rose-500/15 border-rose-500/30'
                : 'bg-amber-500/15 border-amber-500/30'
            }`}
          >
            <AlertTriangle
              size={26}
              color={isDestructive ? '#F87171' : '#FBBF24'}
              strokeWidth={2.3}
            />
          </View>
        </View>

        {/* Title & Warning message */}
        <Text className="text-white text-lg font-bold text-center mb-2">
          {title}
        </Text>

        <Text className="text-slate-400 text-xs text-center leading-5 mb-5">
          {message}
        </Text>

        {/* Optional confirmation phrase verification */}
        {confirmPhrase && (
          <View className="mb-5">
            <Text className="text-slate-400 text-[11px] mb-1.5 font-medium text-center">
              Type <Text className="text-rose-400 font-bold uppercase">{confirmPhrase}</Text> to confirm:
            </Text>
            <TextInput
              value={typedPhrase}
              onChangeText={setTypedPhrase}
              placeholder={confirmPhrase}
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              className="bg-[#0B1220] text-white text-center py-2.5 px-4 rounded-xl border border-slate-700 text-sm font-bold tracking-wider"
            />
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-slate-800 active:bg-slate-700 py-3 rounded-xl items-center justify-center border border-slate-700"
          >
            <Text className="text-slate-300 font-semibold text-sm">Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${
              !isConfirmed || isLoading
                ? 'bg-slate-800/50 opacity-40 border border-slate-700/40'
                : isDestructive
                ? 'bg-rose-600 active:bg-rose-700 shadow-sm'
                : 'bg-emerald-600 active:bg-emerald-700 shadow-sm'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">{confirmText}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function DestructiveActionDialog(props: DestructiveActionDialogProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onCancel}
    >
      {props.visible ? <DestructiveActionDialogContent {...props} /> : null}
    </Modal>
  );
}

export default DestructiveActionDialog;
