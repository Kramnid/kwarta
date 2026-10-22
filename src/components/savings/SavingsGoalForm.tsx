import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Calendar, Check, X, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  CreateSavingsGoalInput,
  SavingsGoalStatus,
} from '@/types/savings';
import {
  stringToCentavos,
  centavosToEditableString,
} from '@/utils/currency';
import {
  SAVINGS_COLORS,
  validateGoalInput,
  formatDeadline,
} from '@/utils/savings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SavingsGoalIconPicker } from './SavingsGoalIconPicker';

interface SavingsGoalFormProps {
  initialValues?: {
    name: string;
    target_centavos: number;
    deadline?: string | null;
    icon: string;
    color: string;
    note?: string | null;
    status?: SavingsGoalStatus;
  };
  onSubmit: (
    data: CreateSavingsGoalInput & { status?: SavingsGoalStatus }
  ) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function SavingsGoalForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Create Goal',
}: SavingsGoalFormProps) {
  const isEditing = Boolean(initialValues);

  const [name, setName] = useState(initialValues?.name || '');
  const [targetAmountStr, setTargetAmountStr] = useState(
    initialValues?.target_centavos
      ? centavosToEditableString(initialValues.target_centavos)
      : ''
  );
  const [deadline, setDeadline] = useState<string | null>(
    initialValues?.deadline || null
  );
  const [icon, setIcon] = useState(initialValues?.icon || 'piggy-bank');
  const [color, setColor] = useState(initialValues?.color || '#10B981');
  const [note, setNote] = useState(initialValues?.note || '');
  const [status, setStatus] = useState<SavingsGoalStatus>(
    initialValues?.status || 'active'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setTargetAmountStr(cleaned);
    if (errors.target) {
      setErrors((prev) => ({ ...prev, target: '' }));
    }
  };

  const handleQuickAddTarget = (pesos: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const currentCentavos = stringToCentavos(targetAmountStr);
    const newCentavos = currentCentavos + pesos * 100;
    setTargetAmountStr(centavosToEditableString(newCentavos));
    if (errors.target) {
      setErrors((prev) => ({ ...prev, target: '' }));
    }
  };

  const handleSetQuickDeadline = (daysAhead: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    const isoDate = date.toISOString().split('T')[0];
    setDeadline(isoDate);
  };

  const handleSubmit = async () => {
    const targetCentavos = stringToCentavos(targetAmountStr);

    const validation = validateGoalInput({
      name,
      target_centavos: targetCentavos,
      deadline,
      note,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        target_centavos: targetCentavos,
        deadline,
        icon,
        color,
        note: note.trim() || null,
        ...(isEditing ? { status } : {}),
      });
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to save savings goal.' });
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Form Error Banner */}
      {errors.form && (
        <View className="flex-row items-center bg-rose-500/15 border border-rose-500/30 p-3.5 rounded-2xl mb-4">
          <AlertCircle size={18} color="#F87171" />
          <Text className="text-rose-300 text-xs font-semibold ml-2 flex-1">
            {errors.form}
          </Text>
        </View>
      )}

      {/* 1. Goal Name Field */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Goal Name <Text className="text-rose-400">*</Text>
          </Text>
          <Text className="text-slate-500 text-[11px]">{name.length}/100</Text>
        </View>

        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="e.g. New Laptop, Emergency Fund"
          placeholderTextColor="#64748B"
          maxLength={100}
          className="text-white text-base font-semibold py-2.5 px-3 bg-[#0B1220] rounded-xl border border-slate-700/80"
          accessibilityLabel="Goal Name"
        />
        {errors.name && (
          <Text className="text-rose-400 text-xs font-medium mt-1">
            {errors.name}
          </Text>
        )}
      </Card>

      {/* 2. Target Amount Field */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Target Amount (PHP) <Text className="text-rose-400">*</Text>
          </Text>
          <Text className="text-slate-500 text-[11px]">Philippine Peso</Text>
        </View>

        <View className="flex-row items-center bg-[#0B1220] rounded-xl border border-slate-700/80 px-3 py-2">
          <Text className="text-emerald-400 text-2xl font-black mr-2">₱</Text>
          <TextInput
            value={targetAmountStr}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            placeholderTextColor="#475569"
            keyboardType="decimal-pad"
            className="flex-1 text-white text-2xl font-black py-0"
            accessibilityLabel="Target Amount"
          />
          {targetAmountStr ? (
            <Pressable
              onPress={() => setTargetAmountStr('')}
              className="p-1 rounded-full bg-slate-800"
            >
              <X size={14} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>
        {errors.target && (
          <Text className="text-rose-400 text-xs font-medium mt-1">
            {errors.target}
          </Text>
        )}

        {/* Quick Add Chips */}
        <View className="flex-row gap-2 mt-3 flex-wrap">
          {[5000, 10000, 25000, 50000].map((pesos) => (
            <Pressable
              key={pesos}
              onPress={() => handleQuickAddTarget(pesos)}
              className="bg-slate-800/90 border border-slate-700/70 px-3 py-1.5 rounded-xl active:bg-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">
                +₱{pesos.toLocaleString('en-US')}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 3. Icon Picker */}
      <Card className="mb-4">
        <SavingsGoalIconPicker
          selectedIcon={icon}
          selectedColor={color}
          onSelectIcon={(nextIcon) => setIcon(nextIcon)}
        />
      </Card>

      {/* 4. Color Swatches */}
      <Card className="mb-4">
        <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
          Goal Color Theme
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {SAVINGS_COLORS.map((swatch) => {
            const isSelected = color === swatch;
            return (
              <Pressable
                key={swatch}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setColor(swatch);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Color ${swatch}`}
                style={{ backgroundColor: swatch }}
                className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
              >
                {isSelected && (
                  <View className="w-5 h-5 rounded-full bg-black/40 items-center justify-center">
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* 5. Target Deadline Field */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Calendar size={14} color="#94A3B8" />
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider ml-1.5">
              Target Deadline (Optional)
            </Text>
          </View>
          {deadline && (
            <Pressable onPress={() => setDeadline(null)}>
              <Text className="text-rose-400 text-xs font-medium">Remove</Text>
            </Pressable>
          )}
        </View>

        {deadline ? (
          <View className="flex-row items-center justify-between bg-[#0B1220] p-3 rounded-xl border border-emerald-500/40 mb-2">
            <Text className="text-emerald-300 text-sm font-semibold">
              {formatDeadline(deadline)}
            </Text>
            <Pressable
              onPress={() => setDeadline(null)}
              className="p-1 rounded-full bg-slate-800"
            >
              <X size={12} color="#94A3B8" />
            </Pressable>
          </View>
        ) : (
          <Text className="text-slate-500 text-xs mb-2">
            No deadline set. Pick a timeframe below:
          </Text>
        )}

        {/* Quick Deadline Preset Chips */}
        <View className="flex-row gap-2 flex-wrap">
          {[
            { label: '30 Days', days: 30 },
            { label: '3 Months', days: 90 },
            { label: '6 Months', days: 180 },
            { label: '1 Year', days: 365 },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handleSetQuickDeadline(item.days)}
              className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl active:bg-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 6. Edit Status Selector (Only if editing) */}
      {isEditing && (
        <Card className="mb-4">
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            Goal Status
          </Text>
          <View className="flex-row bg-[#0B1220] p-1 rounded-2xl border border-slate-700/60">
            {(['active', 'completed', 'archived'] as SavingsGoalStatus[]).map(
              (st) => {
                const isSelected = status === st;
                let activeStyle = 'bg-slate-800 border border-slate-600/50';
                let textStyle = 'text-white font-bold';

                if (st === 'active') {
                  activeStyle = 'bg-emerald-500/20 border border-emerald-500/40';
                  textStyle = 'text-emerald-400 font-bold';
                } else if (st === 'completed') {
                  activeStyle = 'bg-blue-500/20 border border-blue-500/40';
                  textStyle = 'text-blue-400 font-bold';
                }

                return (
                  <Pressable
                    key={st}
                    onPress={() => setStatus(st)}
                    className={`flex-1 py-2 rounded-xl items-center justify-center capitalize ${
                      isSelected ? activeStyle : ''
                    }`}
                  >
                    <Text
                      className={`text-xs capitalize ${
                        isSelected ? textStyle : 'text-slate-400 font-medium'
                      }`}
                    >
                      {st}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </Card>
      )}

      {/* 7. Notes Field */}
      <Card className="mb-6">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Notes (Optional)
          </Text>
          <Text className="text-slate-500 text-[11px]">{note.length}/500</Text>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Why are you saving for this goal?"
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
          className="text-white text-sm py-2 px-3 bg-[#0B1220] rounded-xl border border-slate-700/80 min-h-[70px]"
          accessibilityLabel="Notes"
        />
      </Card>

      {/* Action Buttons */}
      <View className="gap-3">
        <Button
          title={submitButtonText}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="bg-emerald-600 py-3.5"
        />

        {onCancel && (
          <Button
            title="Cancel"
            variant="ghost"
            onPress={onCancel}
            disabled={isSubmitting}
            className="border border-slate-700"
          />
        )}
      </View>
    </ScrollView>
  );
}

export default SavingsGoalForm;
