import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TransactionCategory, TransactionType } from '@/types/finance';
import { CategoryIcon } from './CategoryIcon';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
      {/* Label */}
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

      {/* Dropdown Input Trigger */}
      <Pressable
        onPress={toggleDropdown}
        accessibilityRole="combobox"
        accessibilityLabel={`${label} dropdown`}
        aria-expanded={isOpen}
        style={{
          backgroundColor: '#151F30',
          borderRadius: isOpen ? 16 : 18,
          borderBottomLeftRadius: isOpen ? 0 : 18,
          borderBottomRightRadius: isOpen ? 0 : 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1.5,
          borderColor: error
            ? 'rgba(248, 113, 113, 0.8)'
            : isOpen
            ? '#10B981'
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
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: `${selectedCategory.color}25`,
                borderWidth: 1,
                borderColor: `${selectedCategory.color}50`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <CategoryIcon name={selectedCategory.icon} color={selectedCategory.color} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                {selectedCategory.name}
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '500' }}>
                Tap to change
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: '#1E293B',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>?</Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 15, fontWeight: '600' }}>
              Select a category...
            </Text>
          </View>
        )}

        {/* Dropdown Chevron */}
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.15)' : '#1E293B',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isOpen ? '#10B981' : '#334155',
          }}
        >
          {isOpen ? (
            <ChevronUp size={16} color="#10B981" />
          ) : (
            <ChevronDown size={16} color="#94A3B8" />
          )}
        </View>
      </Pressable>

      {/* Dropdown List Menu (Revealed on Open) */}
      {isOpen && (
        <View
          style={{
            backgroundColor: '#151F30',
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            borderWidth: 1.5,
            borderTopWidth: 0,
            borderColor: '#10B981',
            maxHeight: 260,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {availableCategories.map((cat, index) => {
              const isSelected = cat.id === selectedCategoryId;
              const isDisabled = !!disabledCategoryIds?.has(cat.id);
              const isLast = index === availableCategories.length - 1;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleSelect(cat.id, isDisabled)}
                  accessibilityRole="menuitem"
                  accessibilityLabel={cat.name}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: isSelected
                      ? 'rgba(16, 185, 129, 0.12)'
                      : pressed
                      ? '#1E293B'
                      : 'transparent',
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: 'rgba(51, 65, 85, 0.35)',
                    opacity: isDisabled ? 0.45 : 1,
                  })}
                >
                  {/* Left: Icon + Name */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: `${cat.color}20`,
                        borderWidth: 1,
                        borderColor: `${cat.color}40`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} size={17} />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected ? '#10B981' : '#F1F5F9',
                      }}
                    >
                      {cat.name}
                    </Text>
                  </View>

                  {/* Right: Checkmark or Disabled Badge */}
                  {isSelected && (
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: '#10B981',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={13} color="#0B1220" strokeWidth={3} />
                    </View>
                  )}

                  {isDisabled && (
                    <View
                      style={{
                        backgroundColor: '#1E293B',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#334155',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8' }}>
                        Budgeted
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {error ? (
        <Text className="text-red-400 text-xs mt-1.5 font-medium px-1">{error}</Text>
      ) : null}
    </View>
  );
}
