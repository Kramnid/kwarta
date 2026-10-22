import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Lock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store';
import { TransactionCategory } from '@/types/finance';
import { CreateCategoryInput } from '@/types/settings';
import {
  insertCategory,
  updateCategory,
  deleteCategory,
  checkCategoryUsage,
} from '@/database/categories';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';
import { Button } from '@/components/ui/Button';
import {
  CategoryFormModal,
  DestructiveActionDialog,
} from '@/components/settings';

export default function CategoryManagementScreen() {
  const router = useRouter();
  const { categories, refreshCategories } = useAppStore();

  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCategories = useMemo(() => {
    return (categories || []).filter((c) => c.type === activeType);
  }, [categories, activeType]);

  const expenseCount = useMemo(() => {
    return (categories || []).filter((c) => c.type === 'expense').length;
  }, [categories]);

  const incomeCount = useMemo(() => {
    return (categories || []).filter((c) => c.type === 'income').length;
  }, [categories]);

  const handleOpenCreate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setEditingCategory(null);
    setFormModalVisible(true);
  };

  const handleOpenEdit = (category: TransactionCategory) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setEditingCategory(category);
    setFormModalVisible(true);
  };

  const handleFormSubmit = async (data: CreateCategoryInput) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: data.name,
        icon: data.icon,
        color: data.color,
      });
    } else {
      await insertCategory(data);
    }
    await refreshCategories();
  };

  const handlePromptDelete = async (category: TransactionCategory) => {
    if (category.is_default === 1) {
      Alert.alert(
        'Default Category Protected',
        'System default categories cannot be removed to ensure core financial tracking remains reliable.'
      );
      return;
    }

    try {
      const usage = await checkCategoryUsage(category.id);
      if (usage.inUse) {
        Alert.alert('Cannot Delete Category', usage.message);
        return;
      }

      setCategoryToDelete(category);
      setDeleteModalVisible(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await deleteCategory(categoryToDelete.id);
      await refreshCategories();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Failed to Delete', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Top Header */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800/80">
        <View className="flex-row items-center flex-1 mr-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 items-center justify-center mr-3 active:bg-slate-700 border border-slate-700/60"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={18} color="#F8FAFC" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-white text-xl font-bold tracking-tight">
              Categories
            </Text>
            <Text className="text-slate-400 text-xs">
              Manage transaction categories
            </Text>
          </View>
        </View>

        <Button
          title="Add"
          size="sm"
          onPress={handleOpenCreate}
          leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Segment Control: Expense vs Income */}
        <View className="flex-row bg-[#151F30] p-1 rounded-2xl border border-slate-700/60 mb-5">
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveType('expense');
            }}
            className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row"
            style={
              activeType === 'expense'
                ? {
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    borderColor: 'rgba(244, 63, 94, 0.4)',
                    borderWidth: 1,
                  }
                : undefined
            }
          >
            <Text
              className="text-xs font-bold"
              style={{ color: activeType === 'expense' ? '#FB7185' : '#94A3B8' }}
            >
              Expense Categories ({expenseCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setActiveType('income');
            }}
            className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row"
            style={
              activeType === 'income'
                ? {
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    borderWidth: 1,
                  }
                : undefined
            }
          >
            <Text
              className="text-xs font-bold"
              style={{ color: activeType === 'income' ? '#34D399' : '#94A3B8' }}
            >
              Income Categories ({incomeCount})
            </Text>
          </Pressable>
        </View>

        {/* Categories List */}
        <View className="bg-[#151F30] rounded-2xl border border-slate-700/60 overflow-hidden shadow-sm">
          {filteredCategories.map((item, index) => {
            const isDefault = item.is_default === 1;
            const isLast = index === filteredCategories.length - 1;

            return (
              <View
                key={item.id}
                className={`p-3.5 flex-row items-center justify-between ${
                  !isLast ? 'border-b border-slate-800/80' : ''
                }`}
              >
                {/* Category Icon & Name */}
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    style={{
                      backgroundColor: `${item.color}20`,
                      borderColor: `${item.color}40`,
                    }}
                    className="w-10 h-10 rounded-xl items-center justify-center border mr-3"
                  >
                    <CategoryIcon name={item.icon} color={item.color} size={19} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text
                        numberOfLines={1}
                        className="text-white text-sm font-bold flex-1"
                      >
                        {item.name}
                      </Text>
                    </View>

                    <Text className="text-slate-400 text-[11px] mt-0.5">
                      {isDefault ? 'Default Category' : 'Custom Category'}
                    </Text>
                  </View>
                </View>

                {/* Actions: Edit or Delete */}
                <View className="flex-row items-center gap-1.5">
                  {!isDefault ? (
                    <>
                      <Pressable
                        onPress={() => handleOpenEdit(item)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${item.name}`}
                      >
                        <Pencil size={13} color="#94A3B8" />
                      </Pressable>

                      <Pressable
                        onPress={() => handlePromptDelete(item)}
                        className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 items-center justify-center active:bg-rose-500/25"
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${item.name}`}
                      >
                        <Trash2 size={13} color="#F87171" />
                      </Pressable>
                    </>
                  ) : (
                    <View className="bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded-full flex-row items-center">
                      <Lock size={10} color="#64748B" style={{ marginRight: 4 }} />
                      <Text className="text-slate-400 text-[10px] font-semibold">
                        Default
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        visible={formModalVisible}
        category={editingCategory}
        defaultType={activeType}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DestructiveActionDialog
        visible={deleteModalVisible}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}
