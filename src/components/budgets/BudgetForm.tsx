import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { Check, ShieldCheck, Tag, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CreateBudgetInput } from '@/types/budget';
import { useAppStore } from '@/store';
import { useBudgetStore } from '@/store/useBudgetStore';
import { formatMonthDisplay, getCurrentMonthString, getPreviousMonthString, getNextMonthString } from '@/utils/budget';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AmountInput, stringToCentavos, centavosToEditableString } from '@/components/transactions/AmountInput';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';

interface BudgetFormProps {
  initialData?: Partial<CreateBudgetInput> & { id?: string };
  isEditing?: boolean;
  onSubmit: (data: CreateBudgetInput) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function BudgetForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
  className = '',
}: BudgetFormProps) {
  const { categories } = useAppStore();
  const { budgets, selectedMonth: defaultStoreMonth } = useBudgetStore();

  const [budgetType, setBudgetType] = useState<'overall' | 'category'>(
    initialData?.category_id ? 'category' : initialData?.category_id === null ? 'overall' : 'overall'
  );

  const [month, setMonth] = useState<string>(
    initialData?.month || defaultStoreMonth || getCurrentMonthString()
  );

  const [amountStr, setAmountStr] = useState<string>(
    initialData?.amount_centavos
      ? centavosToEditableString(initialData.amount_centavos)
      : ''
  );

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.category_id || expenseCategories[0]?.id || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if an overall budget already exists for this month (excluding this budget if editing)
  const existingOverall = budgets.find(
    (b) => b.month === month && b.category_id === null && b.id !== initialData?.id
  );

  // Check which categories already have a budget for this month
  const budgetedCategoryIds = new Set(
    budgets
      .filter((b) => b.month === month && b.category_id !== null && b.id !== initialData?.id)
      .map((b) => b.category_id!)
  );

  const handleTypeSelect = (type: 'overall' | 'category') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    setBudgetType(type);
    setErrors((prev) => ({ ...prev, category: '', type: '' }));
  };

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    setMonth((prev) => getPreviousMonthString(prev));
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    setMonth((prev) => getNextMonthString(prev));
  };

  const handleSubmit = async () => {
    const centavos = stringToCentavos(amountStr);
    const newErrors: Record<string, string> = {};

    if (!amountStr || centavos <= 0) {
      newErrors.amount = 'Please enter an amount greater than ₱0.00';
    } else if (centavos > 10000000000) {
      // Max ₱100,000,000 to prevent overflow
      newErrors.amount = 'Amount cannot exceed ₱100,000,000.00';
    }

    if (!month || month.length !== 7) {
      newErrors.month = 'Please select a valid month.';
    }

    if (budgetType === 'overall') {
      if (existingOverall) {
        newErrors.type = `An overall budget already exists for ${formatMonthDisplay(month)}. Please edit that budget instead.`;
      }
    } else {
      if (!selectedCategoryId) {
        newErrors.category = 'Please select an expense category.';
      } else if (budgetedCategoryIds.has(selectedCategoryId)) {
        const cat = expenseCategories.find((c) => c.id === selectedCategoryId);
        newErrors.category = `A budget for ${cat?.name || 'this category'} already exists for ${formatMonthDisplay(month)}.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Fallback
      }
      return;
    }

    setErrors({});

    const budgetPayload: CreateBudgetInput = {
      category_id: budgetType === 'category' ? selectedCategoryId : null,
      amount_centavos: centavos,
      month,
    };

    try {
      await onSubmit(budgetPayload);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Save Failed', msg || 'Could not save budget. Please try again.');
    }
  };

  return (
    <ScrollView
      className={`flex-1 px-5 pt-3 ${className}`}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Budget Type Selector */}
      {!isEditing && (
        <View className="mb-4">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Budget Scope
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => handleTypeSelect('overall')}
              className={`flex-1 p-3.5 rounded-2xl border ${
                budgetType === 'overall'
                  ? 'bg-emerald-500/15 border-emerald-500/50'
                  : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800'
              }`}
            >
              <View className="flex-row items-center mb-1">
                <ShieldCheck
                  size={16}
                  color={budgetType === 'overall' ? '#10B981' : '#94A3B8'}
                  className="mr-2"
                />
                <Text
                  className={`text-sm font-bold ${
                    budgetType === 'overall' ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  Monthly Overall
                </Text>
              </View>
              <Text className="text-slate-400 text-[11px] leading-4">
                Total spending cap for all categories
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleTypeSelect('category')}
              className={`flex-1 p-3.5 rounded-2xl border ${
                budgetType === 'category'
                  ? 'bg-emerald-500/15 border-emerald-500/50'
                  : 'bg-[#151F30] border-slate-700/60 active:bg-slate-800'
              }`}
            >
              <View className="flex-row items-center mb-1">
                <Tag
                  size={16}
                  color={budgetType === 'category' ? '#10B981' : '#94A3B8'}
                  className="mr-2"
                />
                <Text
                  className={`text-sm font-bold ${
                    budgetType === 'category' ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  By Category
                </Text>
              </View>
              <Text className="text-slate-400 text-[11px] leading-4">
                Specific limit for one expense category
              </Text>
            </Pressable>
          </View>
          {errors.type && (
            <Text className="text-red-400 text-xs mt-2 font-medium">
              {errors.type}
            </Text>
          )}
        </View>
      )}

      {/* 2. Month Selector Card */}
      <Card className="mb-4">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
          Budget Period (Month)
        </Text>
        <View className="flex-row items-center justify-between bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
          <Pressable
            onPress={handlePrevMonth}
            hitSlop={8}
            className="w-8 h-8 rounded-xl bg-slate-700 items-center justify-center active:bg-slate-600"
            accessibilityLabel="Previous month"
          >
            <ChevronLeft size={16} color="#94A3B8" />
          </Pressable>

          <View className="flex-row items-center">
            <Calendar size={14} color="#10B981" className="mr-1.5" />
            <Text className="text-white text-sm font-bold">
              {formatMonthDisplay(month)}
            </Text>
          </View>

          <Pressable
            onPress={handleNextMonth}
            hitSlop={8}
            className="w-8 h-8 rounded-xl bg-slate-700 items-center justify-center active:bg-slate-600"
            accessibilityLabel="Next month"
          >
            <ChevronRight size={16} color="#94A3B8" />
          </Pressable>
        </View>
        {errors.month && (
          <Text className="text-red-400 text-xs mt-2 font-medium">
            {errors.month}
          </Text>
        )}
      </Card>

      {/* 3. Category Picker (Only shown for Category Budgets) */}
      {budgetType === 'category' && (
        <View className="mb-4">
          <CategoryPicker
            categories={expenseCategories}
            selectedCategoryId={selectedCategoryId}
            type="expense"
            onSelect={(catId) => {
              setSelectedCategoryId(catId);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            error={errors.category}
          />
        </View>
      )}

      {/* 4. Amount Input */}
      <AmountInput
        value={amountStr}
        onChangeText={(text) => {
          setAmountStr(text);
          if (errors.amount) {
            setErrors((prev) => ({ ...prev, amount: '' }));
          }
        }}
        type="income" // Uses emerald green accent for budget limits
        error={errors.amount}
      />

      {/* 5. Submit Button */}
      <View className="mt-2 mb-8">
        <Button
          title={isEditing ? 'Save Changes' : 'Create Budget'}
          size="lg"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={<Check size={18} color="#FFFFFF" />}
        />
      </View>
    </ScrollView>
  );
}
