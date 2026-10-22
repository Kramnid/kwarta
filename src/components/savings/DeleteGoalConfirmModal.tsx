import React from 'react';
import { View, Text, Modal } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface DeleteGoalConfirmModalProps {
  visible: boolean;
  goalName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteGoalConfirmModal({
  visible,
  goalName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteGoalConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/75 items-center justify-center p-5">
        <View className="bg-[#151F30] rounded-3xl p-6 border border-slate-700/80 w-full max-w-sm shadow-2xl">
          {/* Warning Icon Badge */}
          <View className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 items-center justify-center mb-4">
            <AlertTriangle size={24} color="#F87171" strokeWidth={2.3} />
          </View>

          {/* Title & Message */}
          <Text className="text-white text-lg font-bold">
            Delete Savings Goal?
          </Text>
          <Text className="text-slate-300 text-xs mt-2 leading-relaxed">
            This will permanently delete{' '}
            <Text className="text-white font-semibold">&ldquo;{goalName}&rdquo;</Text> and
            its savings history. This action cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-6">
            <Button
              title="Cancel"
              variant="ghost"
              onPress={onCancel}
              disabled={isDeleting}
              className="flex-1 border border-slate-700"
            />
            <Button
              title="Delete"
              onPress={onConfirm}
              loading={isDeleting}
              disabled={isDeleting}
              className="flex-1 bg-rose-600 active:bg-rose-700"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DeleteGoalConfirmModal;
