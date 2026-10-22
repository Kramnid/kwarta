import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DeleteConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  visible,
  onCancel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Fallback
    }
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/75 items-center justify-center p-6">
        <View className="bg-[#151F30] rounded-3xl p-6 w-full max-w-sm border border-slate-700/80 shadow-2xl">
          <View className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 items-center justify-center mb-4 self-center">
            <Trash2 size={24} color="#F87171" />
          </View>

          <Text className="text-white text-lg font-bold text-center mb-2">
            Delete Transaction?
          </Text>

          <Text className="text-slate-400 text-xs text-center leading-5 mb-6">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={isDeleting}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
            >
              <Text className="text-slate-300 font-semibold text-sm">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={isDeleting}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 items-center justify-center active:bg-red-600 shadow-sm shadow-red-500/30"
            >
              <Text className="text-white font-bold text-sm">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
