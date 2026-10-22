import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionCategory, TransactionType } from '@/types/finance';
import { CategoryIcon } from './CategoryIcon';
import { Card } from '@/components/ui/Card';

interface CategoryPickerProps {
  categories: TransactionCategory[];
  selectedCategoryId: string;
  type: TransactionType;
  onSelect: (categoryId: string) => void;
  error?: string;
  className?: string;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  type,
  onSelect,
  error,
  className = '',
}: CategoryPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Filter categories to only show ones matching active transaction type
  const availableCategories = categories.filter((c) => c.type === type);
  const selectedCategory = availableCategories.find(
    (c) => c.id === selectedCategoryId
  );

  const handleOpen = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    setModalVisible(true);
  };

  const handleSelect = (categoryId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }
    onSelect(categoryId);
    setModalVisible(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
        Category
      </Text>

      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Select category"
      >
        <Card
          className={`flex-row items-center justify-between py-3.5 border ${
            error ? 'border-red-500/80' : 'border-slate-700/60'
          }`}
        >
          {selectedCategory ? (
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: `${selectedCategory.color}25` }}
                className="w-10 h-10 rounded-xl items-center justify-center mr-3 border border-white/5"
              >
                <CategoryIcon
                  name={selectedCategory.icon}
                  color={selectedCategory.color}
                  size={20}
                />
              </View>
              <Text className="text-white text-base font-semibold">
                {selectedCategory.name}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-3">
                <Text className="text-slate-400 text-lg">?</Text>
              </View>
              <Text className="text-slate-500 text-base">Select Category</Text>
            </View>
          )}

          <ChevronDown size={20} color="#94A3B8" />
        </Card>
      </Pressable>

      {error ? (
        <Text className="text-red-400 text-xs mt-1.5 font-medium">{error}</Text>
      ) : null}

      {/* Category Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#0B1220]/95 justify-end">
          <View className="bg-[#151F30] rounded-t-3xl border-t border-slate-700/80 max-h-[80%] flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-700/60">
              <Text className="text-white text-lg font-bold">
                Select {type === 'income' ? 'Income' : 'Expense'} Category
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={8}
                className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Categories Grid List */}
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-2.5">
                {availableCategories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => handleSelect(cat.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Category ${cat.name}`}
                      className={`flex-row items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500/60'
                          : 'bg-slate-800/40 border-slate-700/40 active:bg-slate-800'
                      }`}
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          style={{ backgroundColor: `${cat.color}25` }}
                          className="w-11 h-11 rounded-xl items-center justify-center mr-3.5 border border-white/5"
                        >
                          <CategoryIcon
                            name={cat.icon}
                            color={cat.color}
                            size={20}
                          />
                        </View>
                        <Text className="text-white font-semibold text-base">
                          {cat.name}
                        </Text>
                      </View>

                      {isSelected && (
                        <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
