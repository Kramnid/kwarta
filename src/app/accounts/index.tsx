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
  Trash2,
  CheckCircle2,
  Wifi,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAccountsStore, useAppStore } from '@/store';
import { AccountCard } from '@/types/accounts';
import { splitCentavosToPhp } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
import { DestructiveActionDialog } from '@/components/settings/DestructiveActionDialog';

export default function ManageAccountsScreen() {
  const router = useRouter();
  const { cards, removeCard, updateCardDetails } = useAccountsStore();
  const { transactions, isBalanceHidden } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<AccountCard | null>(null);

  // Compute live cash balance for the primary debit card
  const liveCashBalanceCentavos = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') income += t.amount_centavos;
      else expense += t.amount_centavos;
    }
    return income - expense;
  }, [transactions]);

  const filteredCards = useMemo(() => {
    if (activeFilter === 'all') return cards;
    return cards.filter((c) => c.type === activeFilter);
  }, [cards, activeFilter]);

  const debitCount = useMemo(() => cards.filter((c) => c.type === 'debit').length, [cards]);
  const creditCount = useMemo(() => cards.filter((c) => c.type === 'credit').length, [cards]);

  const handleOpenAdd = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/accounts/add' as any);
  };

  const handleSetDefault = async (card: AccountCard) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    for (const c of cards) {
      if (c.id === card.id) {
        await updateCardDetails(c.id, { is_default: 1 });
      } else if (c.is_default === 1) {
        await updateCardDetails(c.id, { is_default: 0 });
      }
    }
  };

  const handlePromptDelete = (card: AccountCard) => {
    if (cards.length <= 1) {
      Alert.alert(
        'Cannot Delete Only Card',
        'You must keep at least one active card in your accounts list.'
      );
      return;
    }
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    try {
      await removeCard(cardToDelete.id);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', msg);
    } finally {
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Top Navigation Header */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-slate-800/80">
        <View className="flex-row items-center flex-1 mr-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-slate-800 items-center justify-center mr-3 active:bg-slate-700 border border-slate-700"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={18} color="#F8FAFC" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-white text-xl font-bold tracking-tight">
              Accounts & Cards
            </Text>
            <Text className="text-slate-400 text-xs">
              Manage Credit and Debit Accounts
            </Text>
          </View>
        </View>

        <Button
          title="Add"
          size="sm"
          onPress={handleOpenAdd}
          leftIcon={<Plus size={15} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Pills */}
        <View className="flex-row bg-[#151F30] p-1 rounded-2xl border border-slate-700/80 mb-5">
          <Pressable
            onPress={() => setActiveFilter('all')}
            className="flex-1 py-2.5 rounded-xl items-center justify-center"
            style={
              activeFilter === 'all'
                ? {
                    backgroundColor: '#1E293B',
                    borderColor: '#475569',
                    borderWidth: 1,
                  }
                : undefined
            }
          >
            <Text
              className="text-xs font-bold"
              style={{ color: activeFilter === 'all' ? '#FFFFFF' : '#94A3B8' }}
            >
              All ({cards.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('debit')}
            className="flex-1 py-2.5 rounded-xl items-center justify-center"
            style={
              activeFilter === 'debit'
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
              style={{ color: activeFilter === 'debit' ? '#34D399' : '#94A3B8' }}
            >
              Debit ({debitCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('credit')}
            className="flex-1 py-2.5 rounded-xl items-center justify-center"
            style={
              activeFilter === 'credit'
                ? {
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    borderWidth: 1,
                  }
                : undefined
            }
          >
            <Text
              className="text-xs font-bold"
              style={{ color: activeFilter === 'credit' ? '#818CF8' : '#94A3B8' }}
            >
              Credit ({creditCount})
            </Text>
          </Pressable>
        </View>

        {/* Cards List */}
        <View className="gap-5">
          {filteredCards.map((card) => {
            const isDefault = card.is_default === 1;

            // Calculate card balance display
            let amountCentavos = card.balance_centavos;
            if (card.type === 'debit' && isDefault) {
              amountCentavos = liveCashBalanceCentavos;
            } else if (card.type === 'credit' && card.credit_limit_centavos) {
              amountCentavos = card.credit_limit_centavos;
            }

            const { symbol, formattedAmount } = splitCentavosToPhp(amountCentavos);
            const isPositive = amountCentavos >= 0;
            const displayBalance = isBalanceHidden
              ? `${symbol} ••••••`
              : `${isPositive ? '' : '-'}${symbol} ${formattedAmount}`;

            return (
              <View
                key={card.id}
                className="bg-[#151F30] rounded-3xl p-4 border border-slate-700/80 shadow-md"
              >
                {/* 1. Full Realistic Card View */}
                <View
                  style={{ backgroundColor: card.color_primary, height: 180 }}
                  className="rounded-3xl p-5 justify-between overflow-hidden relative border border-white/20 shadow-xl mb-3"
                >
                  {/* Subtle Ambient Background Circles */}
                  <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
                  <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-white/5" />

                  {/* Top Row: Bank & Type */}
                  <View className="flex-row items-center justify-between z-10">
                    <View className="flex-row items-center">
                      <Text className="text-white font-black text-base tracking-tight">
                        {card.bank}
                      </Text>
                      <View className="ml-2 bg-white/20 border border-white/30 px-2 py-0.5 rounded-md">
                        <Text className="text-white text-[10px] font-extrabold tracking-wider uppercase">
                          {card.type}
                        </Text>
                      </View>
                    </View>

                    <View className="rotate-90">
                      <Wifi size={16} color="#FFFFFF" />
                    </View>
                  </View>

                  {/* Middle Row: Chip & Balance */}
                  <View className="z-10 my-auto">
                    <View className="flex-row items-center justify-between mb-1">
                      {/* Metallic Chip */}
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
                        {card.type === 'credit' ? 'Credit Limit' : 'Available Balance'}
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

                  {/* Bottom Row: Holder, Expiry & Last 4 */}
                  <View className="flex-row items-end justify-between z-10 border-t border-white/15 pt-2.5">
                    <View className="flex-1 mr-2">
                      <Text numberOfLines={1} className="text-white font-bold text-xs tracking-wider">
                        {card.cardholder_name}
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
                </View>

                {/* 2. Card Info & Actions Footer */}
                <View className="flex-row items-center justify-between pt-1 px-1">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Text numberOfLines={1} className="text-white text-sm font-bold mr-2">
                      {card.name}
                    </Text>
                    {isDefault && (
                      <View className="bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full flex-row items-center">
                        <CheckCircle2 size={10} color="#10B981" />
                        <Text className="text-emerald-400 text-[10px] font-bold ml-1">
                          PRIMARY
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions: Set Primary or Delete */}
                  <View className="flex-row items-center gap-2">
                    {!isDefault && (
                      <Pressable
                        onPress={() => handleSetDefault(card)}
                        className="bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl active:bg-slate-700"
                      >
                        <Text className="text-slate-300 text-xs font-semibold">
                          Set Primary
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => handlePromptDelete(card)}
                      className="w-8 h-8 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                        borderColor: 'rgba(244, 63, 94, 0.35)',
                        borderWidth: 1,
                      }}
                      accessibilityLabel="Delete card"
                    >
                      <Trash2 size={14} color="#F87171" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>


      {/* Delete Card Confirmation Dialog */}
      <DestructiveActionDialog
        visible={deleteDialogOpen}
        title="Remove Card?"
        message={`Are you sure you want to remove "${cardToDelete?.name}"? This card will be unlinked from your accounts.`}
        confirmText="Remove"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setCardToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}
