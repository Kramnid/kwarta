import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Wifi } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { splitCentavosToPhp } from '@/utils/currency';
import { useAppStore, useSettingsStore } from '@/store';

interface AccountsCardsWidgetProps {
  balanceCentavos: number;
  className?: string;
}

export function AccountsCardsWidget({
  balanceCentavos,
  className = '',
}: AccountsCardsWidgetProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, Math.min(320, width - 56));
  const cardGap = 12;

  const { isBalanceHidden } = useAppStore();
  const { displayName } = useSettingsStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardholderName = (displayName.trim() || 'KWARTA MEMBER').toUpperCase();

  // Debit balance = live total balance
  const isDebitPositive = balanceCentavos >= 0;
  const { symbol: debitSymbol, formattedAmount: debitFormatted } = splitCentavosToPhp(balanceCentavos);
  const debitDisplay = isBalanceHidden
    ? `${debitSymbol} ••••••`
    : `${isDebitPositive ? '' : '-'}${debitSymbol} ${debitFormatted}`;

  // Credit card limit & available
  const creditLimitCentavos = 5000000; // ₱50,000.00 credit limit
  const creditAvailableCentavos = Math.max(0, creditLimitCentavos - Math.max(0, -balanceCentavos));
  const { symbol: creditSymbol, formattedAmount: creditFormatted } = splitCentavosToPhp(creditAvailableCentavos);
  const creditDisplay = isBalanceHidden
    ? `${creditSymbol} ••••••`
    : `${creditSymbol} ${creditFormatted}`;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (cardWidth + cardGap));
    if (index !== activeIndex && (index === 0 || index === 1)) {
      setActiveIndex(index);
    }
  };

  const handleCardPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  return (
    <View className={`mb-5 ${className}`}>
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
          <Text className="text-slate-300 text-xs font-bold tracking-wider uppercase">
            Accounts
          </Text>
          <View className="ml-2 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            <Text className="text-slate-400 text-[10px] font-bold">2 CARDS</Text>
          </View>
        </View>

        {/* Pagination Dots */}
        <View className="flex-row items-center gap-1.5">
          <View
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === 0 ? 'w-4 bg-emerald-400' : 'w-1.5 bg-slate-700'
            }`}
          />
          <View
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === 1 ? 'w-4 bg-indigo-400' : 'w-1.5 bg-slate-700'
            }`}
          />
        </View>
      </View>

      {/* Horizontal Cards Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardGap}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          gap: cardGap,
          paddingRight: 4,
        }}
      >
        {/* ================= CARD 1: DEBIT CARD ================= */}
        <Pressable
          onPress={handleCardPress}
          style={{ width: cardWidth, height: 180 }}
          className="rounded-3xl p-5 justify-between overflow-hidden relative border border-emerald-500/40 bg-[#064E3B] shadow-xl"
        >
          {/* Subtle Ambient Background Accents */}
          <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-emerald-400/15" />
          <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-teal-500/10" />

          {/* Top Row: Brand, Chip & Contactless */}
          <View className="flex-row items-center justify-between z-10">
            <View className="flex-row items-center">
              <Text className="text-white font-extrabold text-base tracking-tight">
                Kwarta
              </Text>
              <View className="ml-2 bg-emerald-400/20 border border-emerald-300/30 px-2 py-0.5 rounded-md">
                <Text className="text-emerald-300 text-[10px] font-extrabold tracking-wider">
                  DEBIT
                </Text>
              </View>
            </View>

            {/* Contactless waves icon */}
            <View className="rotate-90">
              <Wifi size={16} color="#A7F3D0" />
            </View>
          </View>

          {/* Middle Row: Metallic Chip & Masked Number */}
          <View className="z-10 my-auto">
            <View className="flex-row items-center justify-between mb-2.5">
              {/* Golden metallic card chip */}
              <View className="w-10 h-7 rounded-md bg-amber-400/90 border border-amber-300/80 justify-center p-1 shadow-sm">
                <View className="w-full h-[1px] bg-amber-600/70 mb-1" />
                <View className="w-full h-[1px] bg-amber-600/70" />
              </View>

              <Text className="text-emerald-200/90 text-[11px] font-medium tracking-wide">
                Available Balance
              </Text>
            </View>

            {/* Balance Amount */}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-white text-2xl font-black tracking-tight"
            >
              {debitDisplay}
            </Text>
          </View>

          {/* Bottom Row: Cardholder Name, Expiry & Masked Number */}
          <View className="flex-row items-end justify-between z-10 border-t border-emerald-400/20 pt-2.5">
            <View className="flex-1 mr-2">
              <Text numberOfLines={1} className="text-emerald-100 font-bold text-xs tracking-wider">
                {cardholderName}
              </Text>
              <Text className="text-emerald-300/80 text-[11px] font-mono tracking-widest mt-0.5">
                •••• 4821
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-emerald-300/70 text-[9px] font-medium">EXPIRES</Text>
              <Text className="text-white font-mono text-[11px] font-bold">08/29</Text>
            </View>
          </View>
        </Pressable>

        {/* ================= CARD 2: CREDIT CARD ================= */}
        <Pressable
          onPress={handleCardPress}
          style={{ width: cardWidth, height: 180 }}
          className="rounded-3xl p-5 justify-between overflow-hidden relative border border-indigo-500/40 bg-[#1E1B4B] shadow-xl"
        >
          {/* Subtle Ambient Background Accents */}
          <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-violet-400/15" />
          <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-purple-500/10" />

          {/* Top Row: Brand, Chip & Contactless */}
          <View className="flex-row items-center justify-between z-10">
            <View className="flex-row items-center">
              <Text className="text-white font-extrabold text-base tracking-tight">
                Kwarta
              </Text>
              <View className="ml-2 bg-indigo-400/25 border border-indigo-300/30 px-2 py-0.5 rounded-md">
                <Text className="text-indigo-300 text-[10px] font-extrabold tracking-wider">
                  CREDIT
                </Text>
              </View>
            </View>

            {/* Contactless waves icon */}
            <View className="rotate-90">
              <Wifi size={16} color="#C7D2FE" />
            </View>
          </View>

          {/* Middle Row: Metallic Chip & Available Credit */}
          <View className="z-10 my-auto">
            <View className="flex-row items-center justify-between mb-2.5">
              {/* Platinum metallic card chip */}
              <View className="w-10 h-7 rounded-md bg-slate-300 border border-slate-200 justify-center p-1 shadow-sm">
                <View className="w-full h-[1px] bg-slate-500/70 mb-1" />
                <View className="w-full h-[1px] bg-slate-500/70" />
              </View>

              <Text className="text-indigo-200/90 text-[11px] font-medium tracking-wide">
                Available Credit
              </Text>
            </View>

            {/* Credit Amount */}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-white text-2xl font-black tracking-tight"
            >
              {creditDisplay}
            </Text>
          </View>

          {/* Bottom Row: Cardholder Name, Expiry & Masked Number */}
          <View className="flex-row items-end justify-between z-10 border-t border-indigo-400/20 pt-2.5">
            <View className="flex-1 mr-2">
              <Text numberOfLines={1} className="text-indigo-100 font-bold text-xs tracking-wider">
                {cardholderName}
              </Text>
              <Text className="text-indigo-300/80 text-[11px] font-mono tracking-widest mt-0.5">
                •••• 8912
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-indigo-300/70 text-[9px] font-medium">LIMIT</Text>
              <Text className="text-white font-mono text-[11px] font-bold">₱50k</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default AccountsCardsWidget;
