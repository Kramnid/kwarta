import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Check, Trash2, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionType, CreateTransactionInput } from '@/types/finance';
import { useAppStore } from '@/store';
import { validateTransactionInput } from '@/utils/validation';
import {
  getTodayLocalDate,
  formatLocalDate,
  formatTransactionDate,
} from '@/utils/date';
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

const TITLE_SUGGESTIONS: Record<string, string[]> = {
  cat_exp_food_drinks: ['Lunch', 'Dinner', 'Coffee', 'Groceries', 'Snacks', 'Fast Food'],
  cat_exp_transportation: ['Grab', 'Jeepney / Bus', 'Gas / Fuel', 'Train / MRT', 'Parking'],
  cat_exp_shopping: ['Clothes', 'Online Order', 'Supplies', 'Electronics', 'Shoes'],
  cat_exp_bills_utilities: ['Electricity', 'Water', 'Internet WiFi', 'Rent', 'Phone Load'],
  cat_exp_entertainment: ['Netflix / Spotify', 'Movies', 'Gaming', 'Outing'],
  cat_exp_health: ['Pharmacy / Meds', 'Doctor Visit', 'Vitamins', 'Dental'],
  cat_exp_education: ['Tuition', 'Books', 'Course Fee', 'School Supplies'],
  cat_exp_personal_care: ['Haircut', 'Skincare', 'Salon', 'Spa'],
  cat_inc_salary: ['Monthly Salary', '13th Month Pay', 'Bonus', 'Payroll'],
  cat_inc_freelance: ['Client Project', 'Upwork', 'Consulting', 'Design Work'],
  cat_inc_business: ['Sales Revenue', 'Store Sales', 'Services'],
  cat_inc_investments: ['Dividends', 'Crypto Profit', 'Stocks Profit', 'Interest'],
  cat_inc_gifts: ['Gift Received', 'Allowance', 'Birthday Cash'],
};

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

  // Derived date shortcuts
  const todayStr = getTodayLocalDate();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  // Categories matching active type
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

  const handleQuickTitlePress = (suggestedTitle: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTitle(suggestedTitle);
    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
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
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
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

  const suggestions = TITLE_SUGGESTIONS[categoryId] || [];
  const actionVerb = isEditing ? 'Update' : 'Add';
  const centavos = stringToCentavos(amountStr);
  const hasAmount = centavos > 0;

  const submitButtonTitle = hasAmount
    ? `${actionVerb} ${type === 'income' ? 'Income' : 'Expense'} (₱${(centavos / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
    : `${actionVerb} ${type === 'income' ? 'Income' : 'Expense'}`;

  return (
    <View className="flex-1 bg-[#0B1220]">
      <ScrollView
        className={`flex-1 ${className}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Transaction Type Segment (Expense vs Income) */}
        <TransactionTypeSelector value={type} onChange={handleTypeChange} />

        {/* 2. Hero Amount Input with Quick-Add Chips */}
        <AmountInput
          value={amountStr}
          onChangeText={(val) => {
            setAmountStr(val);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          type={type}
          error={errors.amount}
          quickAmounts={type === 'expense' ? [50, 100, 500, 1000] : [1000, 5000, 10000, 20000]}
          label={type === 'income' ? 'Income Amount' : 'Expense Amount'}
        />

        {/* 3. On-Screen Category Grid */}
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

        {/* 4. Quick Date Selector */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2 px-0.5">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Date
            </Text>
            <Text className="text-slate-400 text-xs font-semibold">
              {formatTransactionDate(transactionDate)}
            </Text>
          </View>

          <View className="flex-row gap-2 mb-2">
            {/* Today Pill */}
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setTransactionDate(todayStr);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: transactionDate === todayStr ? 'rgba(16, 185, 129, 0.15)' : '#151F30',
                borderWidth: 1.5,
                borderColor: transactionDate === todayStr ? '#10B981' : 'rgba(51, 65, 85, 0.7)',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: transactionDate === todayStr ? '#10B981' : '#CBD5E1',
                }}
              >
                Today
              </Text>
            </Pressable>

            {/* Yesterday Pill */}
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setTransactionDate(yesterdayStr);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: transactionDate === yesterdayStr ? 'rgba(16, 185, 129, 0.15)' : '#151F30',
                borderWidth: 1.5,
                borderColor: transactionDate === yesterdayStr ? '#10B981' : 'rgba(51, 65, 85, 0.7)',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: transactionDate === yesterdayStr ? '#10B981' : '#CBD5E1',
                }}
              >
                Yesterday
              </Text>
            </Pressable>
          </View>

          {/* Other / Custom Date Picker */}
          <DatePickerModal
            value={transactionDate}
            onChange={(val) => {
              setTransactionDate(val);
              if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
            }}
            error={errors.date}
          />
        </View>

        {/* 5. Title / Payee with Smart Suggestions */}
        <Card
          style={{
            backgroundColor: '#151F30',
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: errors.title ? 'rgba(248, 113, 113, 0.8)' : 'rgba(51, 65, 85, 0.7)',
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              {type === 'income' ? 'Income Source / Title' : 'Payee / Description'}
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
              type === 'income'
                ? 'e.g. Salary, Client Payout'
                : 'e.g. Lunch, Grocery, Coffee'
            }
            placeholderTextColor="#475569"
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF',
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51, 65, 85, 0.5)',
              marginBottom: 10,
            }}
            maxLength={100}
          />

          {/* Quick Suggestions Chips */}
          {suggestions.length > 0 && (
            <View>
              <View className="flex-row items-center mb-2">
                <Sparkles size={11} color="#10B981" style={{ marginRight: 4 }} />
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Quick Suggestions
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {suggestions.map((sug) => (
                  <Pressable
                    key={sug}
                    onPress={() => handleQuickTitlePress(sug)}
                    style={{
                      backgroundColor: title === sug ? '#10B981' : '#1E293B',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      marginRight: 6,
                      borderWidth: 1,
                      borderColor: title === sug ? '#10B981' : '#334155',
                    }}
                  >
                    <Text
                      style={{
                        color: title === sug ? '#0B1220' : '#E2E8F0',
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {sug}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {errors.title ? (
            <Text className="text-red-400 text-xs mt-2 font-medium">{errors.title}</Text>
          ) : null}
        </Card>

        {/* 6. Notes & Details */}
        <Card
          style={{
            backgroundColor: '#151F30',
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1.5,
            borderColor: 'rgba(51, 65, 85, 0.7)',
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Notes (Optional)
            </Text>
            <Text className="text-slate-500 text-xs">{note.length}/500</Text>
          </View>

          <TextInput
            value={note}
            onChangeText={(val) => setNote(val.slice(0, 500))}
            placeholder="Add payment method, tags, or extra details..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            style={{
              fontSize: 14,
              color: '#FFFFFF',
              minHeight: 50,
            }}
            maxLength={500}
          />
        </Card>

        {/* Delete Button (Edit Mode only) */}
        {isEditing && onDelete && (
          <View className="mb-4">
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
      </ScrollView>

      {/* 7. Sticky Bottom Action Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0B1220',
          borderTopWidth: 1,
          borderTopColor: 'rgba(51, 65, 85, 0.6)',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        <Button
          title={submitButtonTitle}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
          rightIcon={<Check size={20} color="#FFFFFF" className="ml-2" />}
        />
      </View>

      {/* Destructive Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </View>
  );
}
