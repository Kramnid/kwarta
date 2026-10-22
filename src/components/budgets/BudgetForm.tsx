import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import {
  Check,
  ShieldCheck,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CreateBudgetInput } from '@/types/budget';
import { useAppStore } from '@/store';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  formatMonthDisplay,
  getCurrentMonthString,
  getPreviousMonthString,
  getNextMonthString,
} from '@/utils/budget';
import { formatCentavosToPhp } from '@/utils/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AmountInput,
  stringToCentavos,
  centavosToEditableString,
} from '@/components/transactions/AmountInput';
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
  const { categories, transactions } = useAppStore();
  const { budgets, selectedMonth: defaultStoreMonth } = useBudgetStore();

  const [budgetType, setBudgetType] = useState<'overall' | 'category'>(
    initialData?.category_id ? 'category' : 'overall'
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

  // Quick month targets
  const currentMonth = getCurrentMonthString();
  const nextMonth = getNextMonthString(currentMonth);

  // Check if an overall budget already exists for this month (excluding this budget if editing)
  const existingOverall = budgets.find(
    (b) => b.month === month && b.category_id === null && b.id !== initialData?.id
  );

  // Check which categories already have a budget for this month
  const budgetedCategoryIds = useMemo(() => {
    return new Set(
      budgets
        .filter((b) => b.month === month && b.category_id !== null && b.id !== initialData?.id)
        .map((b) => b.category_id!)
    );
  }, [budgets, month, initialData?.id]);

  // Contextual Spending Calculation for selected month
  const spentInSelectedMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const tDate = t.transaction_date || '';
        if (!tDate.startsWith(month)) return false;
        if (budgetType === 'category') {
          return t.category_id === selectedCategoryId;
        }
        return true;
      })
      .reduce((sum, t) => sum + t.amount_centavos, 0);
  }, [transactions, month, budgetType, selectedCategoryId]);

  // Contextual Spending Calculation for previous month
  const prevMonthStr = getPreviousMonthString(month);
  const spentInPrevMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const tDate = t.transaction_date || '';
        if (!tDate.startsWith(prevMonthStr)) return false;
        if (budgetType === 'category') {
          return t.category_id === selectedCategoryId;
        }
        return true;
      })
      .reduce((sum, t) => sum + t.amount_centavos, 0);
  }, [transactions, prevMonthStr, budgetType, selectedCategoryId]);

  const activeCategory = expenseCategories.find((c) => c.id === selectedCategoryId);
  const activeCategoryName = activeCategory?.name || 'this category';

  // Daily Allowance Calculation
  const centavos = stringToCentavos(amountStr);
  const [yearStr, monthNumStr] = month.split('-');
  const daysInSelectedMonth = new Date(
    parseInt(yearStr, 10),
    parseInt(monthNumStr, 10),
    0
  ).getDate();
  const dailyAllowanceCentavos =
    centavos > 0 ? Math.round(centavos / Math.max(1, daysInSelectedMonth)) : 0;

  const handleTypeSelect = (type: 'overall' | 'category') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setBudgetType(type);
    setErrors((prev) => ({ ...prev, category: '', type: '' }));
  };

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setMonth((prev) => getPreviousMonthString(prev));
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setMonth((prev) => getNextMonthString(prev));
  };

  const handleApplyMatchLastMonth = () => {
    if (spentInPrevMonth > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      setAmountStr(centavosToEditableString(spentInPrevMonth));
      if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!amountStr || centavos <= 0) {
      newErrors.amount = 'Please enter a budget amount greater than ₱0.00';
    } else if (centavos > 10000000000) {
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
        newErrors.category = `A budget for ${activeCategoryName} already exists for ${formatMonthDisplay(month)}.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
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

  const submitButtonTitle = isEditing
    ? 'Save Changes'
    : centavos > 0
    ? `Create Budget (${formatCentavosToPhp(centavos)})`
    : 'Create Budget';

  return (
    <View className="flex-1 bg-[#0B1220]">
      <ScrollView
        className={`flex-1 ${className}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Budget Scope Cards (Overall vs Category) */}
        {!isEditing && (
          <View className="mb-4">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5 px-0.5">
              Budget Scope
            </Text>
            <View className="flex-row gap-3">
              {/* Monthly Overall */}
              <Pressable
                onPress={() => handleTypeSelect('overall')}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: budgetType === 'overall' ? '#10B981' : 'rgba(51, 65, 85, 0.7)',
                  backgroundColor: budgetType === 'overall' ? 'rgba(16, 185, 129, 0.12)' : '#151F30',
                }}
              >
                <View className="flex-row items-center mb-1.5">
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: budgetType === 'overall' ? '#10B981' : 'rgba(148, 163, 184, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <ShieldCheck
                      size={14}
                      color={budgetType === 'overall' ? '#0B1220' : '#94A3B8'}
                      strokeWidth={2.5}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: budgetType === 'overall' ? '#10B981' : '#E2E8F0',
                    }}
                  >
                    Overall
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#94A3B8', lineHeight: 15 }}>
                  Cap total monthly spending across all categories
                </Text>
              </Pressable>

              {/* By Category */}
              <Pressable
                onPress={() => handleTypeSelect('category')}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: budgetType === 'category' ? '#38BDF8' : 'rgba(51, 65, 85, 0.7)',
                  backgroundColor: budgetType === 'category' ? 'rgba(56, 189, 248, 0.12)' : '#151F30',
                }}
              >
                <View className="flex-row items-center mb-1.5">
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: budgetType === 'category' ? '#38BDF8' : 'rgba(148, 163, 184, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Tag
                      size={14}
                      color={budgetType === 'category' ? '#0B1220' : '#94A3B8'}
                      strokeWidth={2.5}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: budgetType === 'category' ? '#38BDF8' : '#E2E8F0',
                    }}
                  >
                    By Category
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#94A3B8', lineHeight: 15 }}>
                  Set a dedicated limit for a specific category
                </Text>
              </Pressable>
            </View>
            {errors.type && (
              <Text className="text-red-400 text-xs mt-2 font-medium">{errors.type}</Text>
            )}
          </View>
        )}

        {/* 2. Target Month Card with Fast Toggle Pills */}
        <Card
          style={{
            backgroundColor: '#151F30',
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: errors.month ? 'rgba(248, 113, 113, 0.8)' : 'rgba(51, 65, 85, 0.7)',
          }}
        >
          <View className="flex-row items-center justify-between mb-2 px-0.5">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Budget Month
            </Text>
            <View className="flex-row items-center">
              <Calendar size={13} color="#10B981" style={{ marginRight: 4 }} />
              <Text className="text-emerald-400 text-xs font-bold">
                {formatMonthDisplay(month)}
              </Text>
            </View>
          </View>

          {/* Month Stepper Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1E293B',
              padding: 6,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#334155',
              marginBottom: 10,
            }}
          >
            <Pressable
              onPress={handlePrevMonth}
              hitSlop={8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#334155',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Previous month"
            >
              <ChevronLeft size={18} color="#F8FAFC" />
            </Pressable>

            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
              {formatMonthDisplay(month)}
            </Text>

            <Pressable
              onPress={handleNextMonth}
              hitSlop={8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#334155',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Next month"
            >
              <ChevronRight size={18} color="#F8FAFC" />
            </Pressable>
          </View>

          {/* Quick Month Shortcut Pills */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setMonth(currentMonth);
              }}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: month === currentMonth ? 'rgba(16, 185, 129, 0.15)' : '#1E293B',
                borderWidth: 1,
                borderColor: month === currentMonth ? '#10B981' : '#334155',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: month === currentMonth ? '#10B981' : '#CBD5E1',
                }}
              >
                Current Month
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setMonth(nextMonth);
              }}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: month === nextMonth ? 'rgba(56, 189, 248, 0.15)' : '#1E293B',
                borderWidth: 1,
                borderColor: month === nextMonth ? '#38BDF8' : '#334155',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: month === nextMonth ? '#38BDF8' : '#CBD5E1',
                }}
              >
                Next Month
              </Text>
            </Pressable>
          </View>

          {errors.month && (
            <Text className="text-red-400 text-xs mt-2 font-medium">{errors.month}</Text>
          )}
        </Card>

        {/* 3. Category Picker (only for Category Budgets) */}
        {budgetType === 'category' && (
          <CategoryPicker
            categories={expenseCategories}
            selectedCategoryId={selectedCategoryId}
            type="expense"
            onSelect={(catId) => {
              setSelectedCategoryId(catId);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            disabledCategoryIds={budgetedCategoryIds}
            error={errors.category}
            label="Select Category to Budget"
          />
        )}

        {/* 4. Smart Spending Insights (Contextual Co-Pilot) */}
        {(spentInPrevMonth > 0 || spentInSelectedMonth > 0) && (
          <View
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderRadius: 18,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(51, 65, 85, 0.7)',
            }}
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="flex-row items-center">
                <Sparkles size={13} color="#10B981" style={{ marginRight: 5 }} />
                <Text
                  style={{
                    color: '#10B981',
                    fontSize: 10,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Spending Context
                </Text>
              </View>

              {spentInPrevMonth > 0 && (
                <Pressable
                  onPress={handleApplyMatchLastMonth}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Text style={{ color: '#34D399', fontSize: 10, fontWeight: '700' }}>
                    Match Last Month
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={{ color: '#E2E8F0', fontSize: 12, lineHeight: 18 }}>
              {budgetType === 'category'
                ? `You spent ${formatCentavosToPhp(spentInPrevMonth)} on ${activeCategoryName} last month, and ${formatCentavosToPhp(spentInSelectedMonth)} so far in ${formatMonthDisplay(month)}.`
                : `Total expenses were ${formatCentavosToPhp(spentInPrevMonth)} last month, and ${formatCentavosToPhp(spentInSelectedMonth)} so far in ${formatMonthDisplay(month)}.`}
            </Text>
          </View>
        )}

        {/* 5. Hero Amount Input with Presets */}
        <AmountInput
          value={amountStr}
          onChangeText={(text) => {
            setAmountStr(text);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
          }}
          type="income" // Emerald accent for budget targets
          error={errors.amount}
          quickAmounts={
            budgetType === 'overall'
              ? [5000, 10000, 20000, 50000]
              : [1000, 2000, 5000, 10000]
          }
          label="Budget Spending Limit"
        />

        {/* 6. Live Daily Spending Allowance Hint */}
        {dailyAllowanceCentavos > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: 'rgba(56, 189, 248, 0.3)',
              marginBottom: 20,
            }}
          >
            <Info size={15} color="#38BDF8" style={{ marginRight: 8 }} />
            <Text style={{ color: '#E2E8F0', fontSize: 12, flex: 1 }}>
              Allows approx.{' '}
              <Text style={{ color: '#38BDF8', fontWeight: '800' }}>
                {formatCentavosToPhp(dailyAllowanceCentavos)} / day
              </Text>{' '}
              for {formatMonthDisplay(month)}.
            </Text>
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
    </View>
  );
}
