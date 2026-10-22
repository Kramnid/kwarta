import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionCategory } from '@/types/finance';
import { CreateCategoryInput } from '@/types/settings';
import {
  CategoryIcon,
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
} from '@/components/transactions/CategoryIcon';
import { Button } from '@/components/ui/Button';

interface CategoryFormModalProps {
  visible: boolean;
  category?: TransactionCategory | null;
  defaultType?: 'expense' | 'income';
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
}

function CategoryFormContent({
  category,
  defaultType,
  onClose,
  onSubmit,
}: {
  category?: TransactionCategory | null;
  defaultType: 'expense' | 'income';
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
}) {
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(category?.type || defaultType);
  const [selectedIcon, setSelectedIcon] = useState(
    category?.icon || (defaultType === 'income' ? 'briefcase' : 'tag')
  );
  const [selectedColor, setSelectedColor] = useState(category?.color || '#10B981');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }
    if (trimmed.length > 50) {
      setError('Category name cannot exceed 50 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmed,
        type,
        icon: selectedIcon,
        color: selectedColor,
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-end bg-black/70">
      <View className="bg-[#151F30] rounded-t-3xl max-h-[90%] border-t border-slate-700/80 shadow-2xl">
        {/* Header */}
        <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-800">
          <View>
            <Text className="text-white text-lg font-bold">
              {isEditing ? 'Edit Category' : 'New Custom Category'}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {isEditing ? 'Modify category properties' : 'Create an organized spending or income group'}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
          >
            <X size={16} color="#94A3B8" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Live Preview Card */}
          <View className="bg-[#0B1220] p-4 rounded-2xl border border-slate-800/80 flex-row items-center justify-between mb-5">
            <View className="flex-row items-center flex-1 mr-3">
              <View
                style={{
                  backgroundColor: `${selectedColor}22`,
                  borderColor: `${selectedColor}44`,
                }}
                className="w-12 h-12 rounded-2xl items-center justify-center border mr-3"
              >
                <CategoryIcon name={selectedIcon} color={selectedColor} size={22} />
              </View>

              <View className="flex-1">
                <Text numberOfLines={1} className="text-white font-bold text-base">
                  {name.trim() || 'Category Name'}
                </Text>
                <Text className="text-slate-400 text-xs capitalize mt-0.5">
                  {type} Category
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: `${selectedColor}22`, borderColor: `${selectedColor}44` }}
              className="px-2.5 py-1 rounded-full border"
            >
              <Text style={{ color: selectedColor }} className="text-xs font-bold capitalize">
                {type}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl mb-4">
              <Text className="text-rose-400 text-xs font-medium">{error}</Text>
            </View>
          )}

          {/* 2. Type Selector (Disabled when editing to preserve transaction referential semantics) */}
          {!isEditing && (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Category Type
              </Text>
              <View className="flex-row bg-[#0B1220] p-1 rounded-2xl border border-slate-800">
                <Pressable
                  onPress={() => setType('expense')}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                    type === 'expense'
                      ? 'bg-rose-500/20 border border-rose-500/40 shadow-sm'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      type === 'expense' ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    Expense
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setType('income')}
                  className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                    type === 'income'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      type === 'income' ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    Income
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* 3. Name Input */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Category Name
              </Text>
              <Text className="text-slate-500 text-[11px]">
                {name.length}/50
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              maxLength={50}
              placeholder="e.g. Subscriptions, Coffee, Freelance"
              placeholderTextColor="#64748B"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
            />
          </View>

          {/* 4. Color Swatches */}
          <View className="mb-5">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Choose Color
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {AVAILABLE_CATEGORY_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setSelectedColor(color);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-9 h-9 rounded-xl items-center justify-center shadow-sm ${
                      isSelected ? 'border-2 border-white scale-110' : ''
                    }`}
                  >
                    {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Icon Picker */}
          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Choose Icon
            </Text>
            <View className="flex-row flex-wrap gap-2.5 bg-[#0B1220] p-3 rounded-2xl border border-slate-800">
              {AVAILABLE_CATEGORY_ICONS.map((item) => {
                const isSelected = selectedIcon === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setSelectedIcon(item.id);
                    }}
                    style={{
                      backgroundColor: isSelected ? `${selectedColor}25` : '#151F30',
                      borderColor: isSelected ? selectedColor : '#334155',
                    }}
                    className="w-11 h-11 rounded-xl items-center justify-center border"
                    accessibilityLabel={item.label}
                  >
                    <CategoryIcon
                      name={item.id}
                      color={isSelected ? selectedColor : '#94A3B8'}
                      size={19}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit Action */}
          <Button
            title={isEditing ? 'Save Changes' : 'Create Category'}
            onPress={handleSubmit}
            loading={isSubmitting}
            size="md"
          />
        </ScrollView>
      </View>
    </View>
  );
}

export function CategoryFormModal({
  visible,
  category,
  defaultType = 'expense',
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {visible ? (
        <CategoryFormContent
          key={category ? category.id : `new-${defaultType}`}
          category={category}
          defaultType={defaultType}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

export default CategoryFormModal;
