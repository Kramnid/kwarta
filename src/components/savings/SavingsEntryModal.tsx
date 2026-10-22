import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, ArrowUp, ArrowDown, AlertCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SavingsGoal, SavingsEntryType } from '@/types/savings';
import {
  stringToCentavos,
  centavosToEditableString,
  formatCentavosToPhp,
} from '@/utils/currency';
import { validateEntryInput } from '@/utils/savings';
import { Button } from '@/components/ui/Button';

interface SavingsEntryModalProps {
  visible: boolean;
  goal: SavingsGoal;
  initialType?: SavingsEntryType;
  onClose: () => void;
  onSubmit: (data: {
    type: SavingsEntryType;
    amount_centavos: number;
    note?: string | null;
    entry_date: string;
  }) => Promise<void>;
}

interface ModalContentProps {
  goal: SavingsGoal;
  initialType: SavingsEntryType;
  onClose: () => void;
  onSubmit: (data: {
    type: SavingsEntryType;
    amount_centavos: number;
    note?: string | null;
    entry_date: string;
  }) => Promise<void>;
}

function SavingsEntryModalContent({
  goal,
  initialType,
  onClose,
  onSubmit,
}: ModalContentProps) {
  const [type, setType] = useState<SavingsEntryType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
    }
    setAmountStr(cleaned);
    if (error) setError(null);
  };

  const handleQuickAdd = (pesos: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const current = stringToCentavos(amountStr);
    const next = current + pesos * 100;

    // For withdrawal, cap at available allocated
    if (type === 'withdrawal' && next > goal.allocated_centavos) {
      setAmountStr(centavosToEditableString(goal.allocated_centavos));
    } else {
      setAmountStr(centavosToEditableString(next));
    }
    if (error) setError(null);
  };

  const handleSetMaxWithdrawal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAmountStr(centavosToEditableString(goal.allocated_centavos));
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    const amountCentavos = stringToCentavos(amountStr);

    const validation = validateEntryInput({
      amountCentavos,
      type,
      availableAllocatedCentavos: goal.allocated_centavos,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount.');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      return;
    }

    setIsSubmitting(true);
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      await onSubmit({
        type,
        amount_centavos: amountCentavos,
        note: note.trim() || null,
        entry_date: todayIso,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record entry.');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContribution = type === 'contribution';
  const themeColor = isContribution ? '#10B981' : '#F87171';
  const formattedAllocated = formatCentavosToPhp(goal.allocated_centavos);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-end bg-black/70"
    >
      <View className="bg-[#151F30] rounded-t-3xl border-t border-slate-700/80 p-5 max-h-[90%]">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
          <View>
            <Text className="text-white text-lg font-bold">
              {isContribution ? 'Add Money to Goal' : 'Withdraw from Goal'}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {goal.name}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
          >
            <X size={16} color="#94A3B8" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Selector Segment (Add vs Withdraw) */}
          <View className="flex-row bg-[#0B1220] p-1 rounded-2xl border border-slate-700/70 mb-4">
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setType('contribution');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
                isContribution
                  ? 'bg-emerald-500/20 border border-emerald-500/50'
                  : ''
              }`}
            >
              <ArrowUp
                size={14}
                color={isContribution ? '#10B981' : '#94A3B8'}
                strokeWidth={2.5}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-xs font-bold ${
                  isContribution ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                Add Money
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setType('withdrawal');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
                !isContribution
                  ? 'bg-rose-500/20 border border-rose-500/50'
                  : ''
              }`}
            >
              <ArrowDown
                size={14}
                color={!isContribution ? '#F87171' : '#94A3B8'}
                strokeWidth={2.5}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-xs font-bold ${
                  !isContribution ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                Withdraw
              </Text>
            </Pressable>
          </View>

          {/* Current Allocated Info Banner */}
          <View className="flex-row items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 mb-4">
            <Text className="text-slate-400 text-xs font-medium">
              Currently Saved in Goal:
            </Text>
            <Text className="text-white text-xs font-bold">
              {formattedAllocated}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="flex-row items-center bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl mb-4">
              <AlertCircle size={16} color="#F87171" />
              <Text className="text-rose-300 text-xs font-semibold ml-2 flex-1">
                {error}
              </Text>
            </View>
          )}

          {/* Amount Input */}
          <View className="bg-[#0B1220] rounded-2xl p-4 border border-slate-700/80 mb-3">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              {isContribution ? 'Contribution Amount' : 'Withdrawal Amount'}
            </Text>

            <View className="flex-row items-center">
              <Text
                style={{ color: themeColor }}
                className="text-3xl font-black mr-2"
              >
                ₱
              </Text>
              <TextInput
                value={amountStr}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#475569"
                keyboardType="decimal-pad"
                autoFocus
                className="flex-1 text-white text-3xl font-black py-0"
                accessibilityLabel="Savings entry amount"
              />
              {amountStr ? (
                <Pressable
                  onPress={() => setAmountStr('')}
                  className="p-1 rounded-full bg-slate-800"
                >
                  <X size={14} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Quick Add Chips */}
          <View className="flex-row gap-2 mb-4 flex-wrap">
            {[500, 1000, 2000, 5000].map((pesos) => (
              <Pressable
                key={pesos}
                onPress={() => handleQuickAdd(pesos)}
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl active:bg-slate-700"
              >
                <Text className="text-slate-300 text-xs font-semibold">
                  +₱{pesos.toLocaleString('en-US')}
                </Text>
              </Pressable>
            ))}

            {!isContribution && goal.allocated_centavos > 0 && (
              <Pressable
                onPress={handleSetMaxWithdrawal}
                className="bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-xl active:bg-rose-500/30"
              >
                <Text className="text-rose-400 text-xs font-bold">
                  Withdraw All
                </Text>
              </Pressable>
            )}
          </View>

          {/* Optional Note */}
          <View className="mb-4">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Note (Optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={
                isContribution
                  ? 'e.g. Extra savings from bonus'
                  : 'e.g. Emergency laptop repair'
              }
              placeholderTextColor="#64748B"
              className="text-white text-sm py-2.5 px-3 bg-[#0B1220] rounded-xl border border-slate-700/80"
            />
          </View>

          {/* Accounting Note */}
          <View className="flex-row items-center bg-slate-800/40 p-3 rounded-xl mb-4">
            <Info size={14} color="#94A3B8" />
            <Text className="text-slate-400 text-[11px] ml-2 flex-1">
              Savings allocations are manually tracked toward this goal and do not alter your everyday transaction balance.
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={isContribution ? 'Add to Goal' : 'Withdraw from Goal'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            className={isContribution ? 'bg-emerald-600' : 'bg-rose-600'}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

export function SavingsEntryModal({
  visible,
  goal,
  initialType = 'contribution',
  onClose,
  onSubmit,
}: SavingsEntryModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {visible ? (
        <SavingsEntryModalContent
          key={`${goal.id}_${initialType}`}
          goal={goal}
          initialType={initialType}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

export default SavingsEntryModal;
