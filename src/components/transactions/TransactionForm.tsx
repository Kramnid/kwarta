import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';
import {
  TransactionType,
  CreateTransactionInput,
} from '@/types/finance';
import { useAppStore } from '@/store';
import { validateTransactionInput } from '@/utils/validation';
import { getTodayLocalDate } from '@/utils/date';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionTypeSelector } from './TransactionTypeSelector';
import {
  AmountInput,
  stringToCentavos,
  centavosToEditableString,
} from './AmountInput';
import { CategoryPicker } from './CategoryPicker';
import { DatePickerModal } from './DatePickerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TransactionFormProps {
  initialData?: Partial<CreateTransactionInput> & { id?: string };
  isEditing?: boolean;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function TransactionForm({
  initialData,
  isEditing = false,
  onSubmit,
  onDelete,
  isSubmitting = false,
  className = '',
}: TransactionFormProps) {
  const { categories } = useAppStore();

  const [type, setType] = useState<TransactionType>(
    initialData?.type || 'expense'
  );
  const [amountStr, setAmountStr] = useState<string>(
    initialData?.amount_centavos
      ? centavosToEditableString(initialData.amount_centavos)
      : ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.category_id || ''
  );
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [transactionDate, setTransactionDate] = useState<string>(
    initialData?.transaction_date || getTodayLocalDate()
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive active categoryId for the active transaction type
  const matchingCategories = categories.filter((c) => c.type === type);
  const isValidCategory = matchingCategories.some((c) => c.id === selectedCategoryId);
  const categoryId = isValidCategory
    ? selectedCategoryId
    : matchingCategories[0]?.id || '';

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matching = categories.find((c) => c.type === newType);
    setSelectedCategoryId(matching ? matching.id : '');
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handleSubmit = async () => {
    const centavos = stringToCentavos(amountStr);

    const inputData: CreateTransactionInput = {
      type,
      amount_centavos: centavos,
      category_id: categoryId,
      title: title.trim(),
      note: note.trim() || null,
      transaction_date: transactionDate,
    };

    const validation = validateTransactionInput(inputData, categories);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    try {
      await onSubmit(inputData);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Save Failed', msg || 'Could not save transaction. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Delete Failed', msg || 'Could not delete transaction.');
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const actionVerb = isEditing ? 'Update' : 'Save';
  const submitButtonTitle = `${actionVerb} ${
    type === 'income' ? 'Income' : 'Expense'
  }`;

  return (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Transaction Type Selector (Expense vs Income) */}
      <TransactionTypeSelector value={type} onChange={handleTypeChange} />

      {/* 2. Amount Input (₱ 0.00) */}
      <AmountInput
        value={amountStr}
        onChangeText={(val) => {
          setAmountStr(val);
          if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
        }}
        type={type}
        error={errors.amount}
      />

      {/* 3. Category Selector */}
      <CategoryPicker
        categories={categories}
        selectedCategoryId={categoryId}
        type={type}
        onSelect={(id) => {
          setSelectedCategoryId(id);
          if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
        }}
        error={errors.category}
      />

      {/* 4. Transaction Title (Required) */}
      <Card
        className={`mb-4 border ${
          errors.title ? 'border-red-500/80' : 'border-slate-700/60'
        }`}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Title / Payee
          </Text>
          <Text className="text-slate-500 text-xs">{title.length}/100</Text>
        </View>

        <TextInput
          value={title}
          onChangeText={(val) => {
            setTitle(val.slice(0, 100));
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder={
            type === 'income' ? 'e.g. October Salary' : 'e.g. Lunch at Jollibee'
          }
          placeholderTextColor="#475569"
          className="text-base text-white py-1 font-medium"
          maxLength={100}
        />

        {errors.title ? (
          <Text className="text-red-400 text-xs mt-2 font-medium">
            {errors.title}
          </Text>
        ) : null}
      </Card>

      {/* 5. Date Picker */}
      <DatePickerModal
        value={transactionDate}
        onChange={(val) => {
          setTransactionDate(val);
          if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
        }}
        error={errors.date}
      />

      {/* 6. Note (Optional) */}
      <Card className="mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Notes & Details
          </Text>
          <Text className="text-slate-500 text-xs">{note.length}/500</Text>
        </View>

        <TextInput
          value={note}
          onChangeText={(val) => setNote(val.slice(0, 500))}
          placeholder="Add tags, receipt details, or payment method..."
          placeholderTextColor="#475569"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="text-sm text-white py-1 min-h-[72px]"
          maxLength={500}
        />
      </Card>

      {/* 7. Save / Submit Button */}
      <Button
        title={submitButtonTitle}
        onPress={handleSubmit}
        loading={isSubmitting}
        size="lg"
        rightIcon={<Check size={20} color="#FFFFFF" className="ml-2" />}
      />

      {/* 8. Delete Transaction Button (Edit Mode only) */}
      {isEditing && onDelete && (
        <View className="mt-4">
          <Button
            title="Delete Transaction"
            variant="ghost"
            onPress={() => setDeleteModalVisible(true)}
            disabled={isSubmitting}
            leftIcon={<Trash2 size={18} color="#F87171" className="mr-2" />}
            textStyle={{ color: '#F87171' }}
          />
        </View>
      )}

      {/* Destructive Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </ScrollView>
  );
}
