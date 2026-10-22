import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CategorySpending } from '@/types/finance';
import { formatCentavosToPhp } from '@/utils/currency';
import { CategoryIcon } from '@/components/transactions/CategoryIcon';

interface CategorySpendingListProps {
  categories: CategorySpending[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategorySpendingList({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySpendingListProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="bg-[#151F30] rounded-2xl p-4 border border-slate-700/60 mb-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-3 pb-2.5 border-b border-slate-700/50">
        <Text className="text-white font-bold text-sm">
          Top Spending Categories
        </Text>
        <Text className="text-slate-400 text-xs font-semibold">
          Highest to Lowest
        </Text>
      </View>

      <View className="gap-3.5">
        {categories.map((item) => {
          const isSelected = selectedCategoryId === item.categoryId;
          const color = item.categoryColor || '#10B981';

          return (
            <TouchableOpacity
              key={`cat-item-${item.categoryId}`}
              onPress={() =>
                onSelectCategory(isSelected ? null : item.categoryId)
              }
              activeOpacity={0.7}
              style={{
                backgroundColor: isSelected ? '#1E293B' : 'transparent',
              }}
              className="p-2 -m-1 rounded-xl transition-all"
            >
              {/* Row: Icon, Name, Amount, Percentage */}
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: `${color}40`,
                    }}
                    className="w-8 h-8 rounded-lg items-center justify-center border mr-2.5"
                  >
                    <CategoryIcon
                      name={item.categoryIcon}
                      color={color}
                      size={16}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-slate-200 text-xs font-bold flex-1"
                  >
                    {item.categoryName}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-white text-xs font-extrabold mr-2">
                    {formatCentavosToPhp(item.amount)}
                  </Text>
                  <Text
                    style={{ color: isSelected ? color : '#94A3B8' }}
                    className="text-xs font-bold w-12 text-right"
                  >
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <View
                  style={{
                    width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                    minWidth: 6,
                    backgroundColor: color,
                  }}
                  className="h-full rounded-full"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
