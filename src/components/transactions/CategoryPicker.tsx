import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionCategory, TransactionType } from '@/types/finance';
import { CategoryIcon } from './CategoryIcon';

interface CategoryPickerProps {
  categories: TransactionCategory[];
  selectedCategoryId: string;
  type: TransactionType;
  onSelect: (categoryId: string) => void;
  error?: string;
  disabledCategoryIds?: Set<string>;
  disabledMessage?: string;
  className?: string;
  label?: string;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  type,
  onSelect,
  error,
  disabledCategoryIds,
  disabledMessage = 'Already budgeted for this month',
  className = '',
  label = 'Category',
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter categories to only show ones matching active transaction type
  const availableCategories = categories.filter((c) => c.type === type);
  const selectedCategory = availableCategories.find((c) => c.id === selectedCategoryId);

  const toggleDropdown = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSelect = (categoryId: string, isDisabled: boolean) => {
    if (isDisabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onSelect(categoryId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      {/* Header Label */}
      <View className="flex-row items-center justify-between mb-2 px-0.5">
        <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </Text>
        {selectedCategory && (
          <Text style={{ color: selectedCategory.color, fontSize: 11, fontWeight: '700' }}>
            {selectedCategory.name}
          </Text>
        )}
      </View>

      {/* Expandable Trigger Card */}
      <TouchableOpacity
        onPress={toggleDropdown}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Select category"
        style={{
          backgroundColor: '#151F30',
          borderRadius: isOpen ? 18 : 20,
          borderBottomLeftRadius: isOpen ? 0 : 20,
          borderBottomRightRadius: isOpen ? 0 : 20,
          paddingHorizontal: 16,
          paddingVertical: 13,
          borderWidth: 1.5,
          borderColor: error
            ? 'rgba(248, 113, 113, 0.8)'
            : isOpen
            ? (selectedCategory?.color || '#10B981')
            : 'rgba(51, 65, 85, 0.7)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {selectedCategory ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: `${selectedCategory.color}25`,
                borderWidth: 1.5,
                borderColor: `${selectedCategory.color}50`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <CategoryIcon name={selectedCategory.icon} color={selectedCategory.color} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                {selectedCategory.name}
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '500', marginTop: 1 }}>
                Tap to change category
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: '#1E293B',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>?</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94A3B8', fontSize: 15, fontWeight: '600' }}>
                Select a category...
              </Text>
              <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 1 }}>
                Tap to change category
              </Text>
            </View>
          </View>
        )}

        {/* Chevron Indicator */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.15)' : '#1E293B',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isOpen ? (selectedCategory?.color || '#10B981') : '#334155',
          }}
        >
          {isOpen ? (
            <ChevronUp size={16} color={selectedCategory?.color || '#10B981'} />
          ) : (
            <ChevronDown size={16} color="#94A3B8" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Category Tiles Grid */}
      {isOpen && (
        <View
          style={{
            backgroundColor: '#151F30',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderWidth: 1.5,
            borderTopWidth: 0,
            borderColor: selectedCategory?.color || '#10B981',
            padding: 12,
            paddingTop: 10,
          }}
        >
          <View
            style={{
              height: 1,
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
              marginBottom: 12,
            }}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {availableCategories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              const isDisabled = !!disabledCategoryIds?.has(cat.id);

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelect(cat.id, isDisabled)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={cat.name}
                  style={{
                    width: '31%',
                    marginBottom: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 6,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected
                      ? `${cat.color}22`
                      : isDisabled
                      ? '#0F172A'
                      : '#1E293B',
                    borderWidth: 1.5,
                    borderColor: isSelected
                      ? cat.color
                      : isDisabled
                      ? '#1E293B'
                      : 'rgba(51, 65, 85, 0.6)',
                    opacity: isDisabled ? 0.45 : 1,
                    position: 'relative',
                  }}
                >
                  {/* Active Checkmark Badge */}
                  {isSelected && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: cat.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={10} color="#0B1220" strokeWidth={3} />
                    </View>
                  )}

                  {/* Category Icon */}
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: isSelected ? `${cat.color}33` : `${cat.color}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={19} />
                  </View>

                  {/* Category Name */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      textAlign: 'center',
                    }}
                  >
                    {cat.name}
                  </Text>

                  {/* Disabled Badge */}
                  {isDisabled && (
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '700',
                        color: '#94A3B8',
                        marginTop: 2,
                      }}
                    >
                      Budgeted
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {error && (
        <Text className="text-red-400 text-xs mt-1.5 font-medium px-1">{error}</Text>
      )}
    </View>
  );
}

export default CategoryPicker;

