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
import { useRouter } from 'expo-router';
import { Wifi, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { splitCentavosToPhp } from '@/utils/currency';
import { useAppStore, useSettingsStore, useAccountsStore } from '@/store';
import { AccountCard } from '@/types/accounts';

interface AccountsCardsWidgetProps {
  balanceCentavos: number;
  className?: string;
}

export function AccountsCardsWidget({
  balanceCentavos,
  className = '',
}: AccountsCardsWidgetProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, Math.min(320, width - 56));
  const cardGap = 12;

  const { isBalanceHidden } = useAppStore();
  const { displayName } = useSettingsStore();
  const { cards } = useAccountsStore();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback cards if database is still initializing or empty
  const fallbackCards: AccountCard[] = [
    {
      id: 'fallback_debit',
      name: 'Kwarta Signature Debit',
      bank: 'Kwarta',
      type: 'debit',
      card_number_last4: '4821',
      balance_centavos: balanceCentavos,
      credit_limit_centavos: null,
      cardholder_name: (displayName.trim() || 'KWARTA MEMBER').toUpperCase(),
      expiry_date: '08/29',
      color_primary: '#064E3B',
      color_secondary: '#0F766E',
      network: 'Visa',
      is_default: 1,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'fallback_credit',
      name: 'BPI Rewards Card',
      bank: 'BPI',
      type: 'credit',
      card_number_last4: '8912',
      balance_centavos: 0,
      credit_limit_centavos: 5000000,
      cardholder_name: (displayName.trim() || 'KWARTA MEMBER').toUpperCase(),
      expiry_date: '11/30',
      color_primary: '#8A1538',
      color_secondary: '#4C0519',
      network: 'Mastercard',
      is_default: 0,
      created_at: '',
      updated_at: '',
    },
  ];

  const displayCards = cards.length > 0 ? cards : fallbackCards;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (cardWidth + cardGap));
    if (index !== activeIndex && index >= 0 && index < displayCards.length) {
      setActiveIndex(index);
    }
  };

  const handleCardPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const handleManagePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/accounts' as any);
  };

  return (
    <View className={`mb-5 ${className}`}>
      {/* Section Header with Manage Shortcut */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
          <Text className="text-slate-300 text-xs font-bold tracking-wider uppercase">
            Accounts
          </Text>
          <View className="ml-2 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            <Text className="text-slate-400 text-[10px] font-bold">
              {displayCards.length} {displayCards.length === 1 ? 'CARD' : 'CARDS'}
            </Text>
          </View>
        </View>

        {/* Manage Button */}
        <Pressable
          onPress={handleManagePress}
          hitSlop={8}
          className="flex-row items-center bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-full active:bg-slate-700"
          accessibilityRole="button"
          accessibilityLabel="Manage Accounts and Cards"
        >
          <Text className="text-emerald-400 text-xs font-bold mr-1">
            Manage
          </Text>
          <ChevronRight size={13} color="#10B981" />
        </Pressable>
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
        {displayCards.map((card) => {
          const isDebit = card.type === 'debit';
          const isDefault = card.is_default === 1;

          // Compute displayed balance
          let amountCentavos = card.balance_centavos;
          if (isDebit && isDefault) {
            amountCentavos = balanceCentavos;
          } else if (!isDebit && card.credit_limit_centavos) {
            amountCentavos = card.credit_limit_centavos;
          }

          const { symbol, formattedAmount } = splitCentavosToPhp(amountCentavos);
          const isPositive = amountCentavos >= 0;
          const displayBalance = isBalanceHidden
            ? `${symbol} ••••••`
            : `${isPositive ? '' : '-'}${symbol} ${formattedAmount}`;

          return (
            <Pressable
              key={card.id}
              onPress={handleCardPress}
              style={{
                width: cardWidth,
                height: 180,
                backgroundColor: card.color_primary,
              }}
              className="rounded-3xl p-5 justify-between overflow-hidden relative border border-white/20 shadow-xl"
            >
              {/* Subtle Ambient Background Circles */}
              <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
              <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-white/5" />

              {/* Top Row: Bank Brand & Type Badge */}
              <View className="flex-row items-center justify-between z-10">
                <View className="flex-row items-center">
                  <Text className="text-white font-extrabold text-base tracking-tight">
                    {card.bank}
                  </Text>
                  <View className="ml-2 bg-white/20 border border-white/30 px-2 py-0.5 rounded-md">
                    <Text className="text-white text-[10px] font-extrabold tracking-wider uppercase">
                      {card.type}
                    </Text>
                  </View>
                </View>

                {/* Contactless waves icon */}
                <View className="rotate-90">
                  <Wifi size={16} color="#FFFFFF" />
                </View>
              </View>

              {/* Middle Row: Chip & Balance/Limit */}
              <View className="z-10 my-auto">
                <View className="flex-row items-center justify-between mb-1">
                  {/* Metallic Card Chip */}
                  <View
                    style={{
                      width: 40,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: '#F59E0B',
                      borderColor: '#FDE68A',
                      borderWidth: 1.5,
                      justifyContent: 'center',
                      padding: 4,
                    }}
                  >
                    <View style={{ width: '100%', height: 1.5, backgroundColor: '#B45309', marginBottom: 4 }} />
                    <View style={{ width: '100%', height: 1.5, backgroundColor: '#B45309' }} />
                  </View>

                  <Text className="text-white/80 text-[11px] font-medium">
                    {isDebit ? 'Available Balance' : 'Credit Limit'}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="text-white text-2xl font-black tracking-tight"
                >
                  {displayBalance}
                </Text>
              </View>

              {/* Bottom Row: Cardholder Name, Expiry & Masked Number */}
              <View className="flex-row items-end justify-between z-10 border-t border-white/15 pt-2.5">
                <View className="flex-1 mr-2">
                  <Text numberOfLines={1} className="text-white font-bold text-xs tracking-wider">
                    {(card.cardholder_name || displayName || 'KWARTA MEMBER').toUpperCase()}
                  </Text>
                  <Text className="text-white/90 text-[11px] font-mono tracking-widest mt-0.5">
                    •••• {card.card_number_last4}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-white/70 text-[9px] font-medium">
                    {card.network.toUpperCase()}
                  </Text>
                  <Text className="text-white font-mono text-[11px] font-bold">
                    {card.expiry_date}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      {displayCards.length > 1 && (
        <View className="flex-row justify-center items-center gap-1.5 mt-3">
          {displayCards.map((c, i) => (
            <View
              key={c.id}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === i ? 'w-4 bg-emerald-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default AccountsCardsWidget;
