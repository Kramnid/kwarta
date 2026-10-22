import React from 'react';
import { Modal, View } from 'react-native';
import { CreateAccountCardInput } from '@/types/accounts';
import { CardForm } from './CardForm';

export interface AddCardModalProps {
  visible: boolean;
  defaultCardholderName?: string;
  onClose: () => void;
  onSubmit: (card: CreateAccountCardInput) => Promise<void>;
}

export function AddCardModal({
  visible,
  defaultCardholderName = 'KWARTA MEMBER',
  onClose,
  onSubmit,
}: AddCardModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/75">
        <View className="bg-[#151F30] rounded-t-3xl max-h-[92%] border-t border-slate-700/80 shadow-2xl">
          <CardForm
            initialCardholderName={defaultCardholderName}
            onSubmit={async (card) => {
              await onSubmit(card);
              onClose();
            }}
            onCancel={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

export default AddCardModal;
