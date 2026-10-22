import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { X, Wifi, Check, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  CardType,
  CardNetwork,
  CreateAccountCardInput,
  PHILIPPINE_CARD_TEMPLATES,
  BankCardTemplate,
} from '@/types/accounts';
import { Button } from '@/components/ui/Button';

interface AddCardModalProps {
  visible: boolean;
  defaultCardholderName: string;
  onClose: () => void;
  onSubmit: (card: CreateAccountCardInput) => Promise<void>;
}

function AddCardModalContent({
  defaultCardholderName,
  onClose,
  onSubmit,
}: {
  defaultCardholderName: string;
  onClose: () => void;
  onSubmit: (card: CreateAccountCardInput) => Promise<void>;
}) {
  const initialTemplate = PHILIPPINE_CARD_TEMPLATES[0]; // BDO Titanium

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate.id);
  const [bank, setBank] = useState(initialTemplate.bankName);
  const [name, setName] = useState(initialTemplate.cardName);
  const [type, setType] = useState<CardType>(initialTemplate.defaultType);
  const [network, setNetwork] = useState<CardNetwork>(initialTemplate.network);
  const [last4, setLast4] = useState('1234');
  const [expiry, setExpiry] = useState('12/28');
  const [cardholderName, setCardholderName] = useState(defaultCardholderName || 'KWARTA MEMBER');
  const [amountInput, setAmountInput] = useState(
    initialTemplate.defaultCreditLimitCentavos
      ? String(initialTemplate.defaultCreditLimitCentavos / 100)
      : '0'
  );
  const [colorPrimary, setColorPrimary] = useState(initialTemplate.primaryColor);
  const [colorSecondary, setColorSecondary] = useState(initialTemplate.secondaryColor);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTemplate = (template: BankCardTemplate) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setSelectedTemplateId(template.id);
    setBank(template.bankName);
    setName(template.cardName);
    setType(template.defaultType);
    setNetwork(template.network);
    setColorPrimary(template.primaryColor);
    setColorSecondary(template.secondaryColor);

    if (template.defaultType === 'credit') {
      setAmountInput(
        template.defaultCreditLimitCentavos
          ? String(template.defaultCreditLimitCentavos / 100)
          : '50000'
      );
    } else {
      setAmountInput('0');
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedBank = bank.trim();
    const trimmedLast4 = last4.trim().replace(/\D/g, '');
    const trimmedExpiry = expiry.trim();
    const trimmedHolder = cardholderName.trim().toUpperCase();

    if (!trimmedName) {
      setError('Card nickname is required.');
      return;
    }
    if (!trimmedBank) {
      setError('Bank name is required.');
      return;
    }
    if (trimmedLast4.length !== 4) {
      setError('Please enter exactly 4 digits for the card number.');
      return;
    }
    if (!trimmedExpiry || trimmedExpiry.length < 4) {
      setError('Please enter a valid expiry date (e.g. 12/28).');
      return;
    }

    const numericAmount = Math.max(0, Math.round(Number(amountInput) * 100)) || 0;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        bank: trimmedBank,
        type,
        card_number_last4: trimmedLast4,
        balance_centavos: type === 'debit' ? numericAmount : 0,
        credit_limit_centavos: type === 'credit' ? numericAmount : null,
        cardholder_name: trimmedHolder || 'KWARTA MEMBER',
        expiry_date: trimmedExpiry,
        color_primary: colorPrimary,
        color_secondary: colorSecondary,
        network,
        is_default: 0,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-end bg-black/75">
      <View className="bg-[#151F30] rounded-t-3xl max-h-[92%] border-t border-slate-700/80 shadow-2xl">
        {/* Header */}
        <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-800">
          <View>
            <Text className="text-white text-lg font-bold">Add Account Card</Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Choose a Philippine card template or create a custom card
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
          {/* ================= 1. LIVE CARD PREVIEW ================= */}
          <View
            style={{ backgroundColor: colorPrimary, height: 180 }}
            className="rounded-3xl p-5 justify-between overflow-hidden relative border border-white/20 shadow-2xl mb-5"
          >
            {/* Ambient Background Circles */}
            <View className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
            <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-white/5" />

            {/* Top Row: Brand & Type Badge */}
            <View className="flex-row items-center justify-between z-10">
              <View className="flex-row items-center">
                <Text className="text-white font-extrabold text-base tracking-tight">
                  {bank || 'Bank'}
                </Text>
                <View className="ml-2 bg-white/20 border border-white/30 px-2 py-0.5 rounded-md">
                  <Text className="text-white text-[10px] font-extrabold tracking-wider uppercase">
                    {type}
                  </Text>
                </View>
              </View>

              <View className="rotate-90">
                <Wifi size={16} color="#FFFFFF" />
              </View>
            </View>

            {/* Middle Row: Metallic Chip & Balance/Limit */}
            <View className="z-10 my-auto">
              <View className="flex-row items-center justify-between mb-1">
                <View className="w-10 h-7 rounded-md bg-amber-400/90 border border-amber-300 justify-center p-1 shadow-sm">
                  <View className="w-full h-[1px] bg-amber-600/70 mb-1" />
                  <View className="w-full h-[1px] bg-amber-600/70" />
                </View>

                <Text className="text-white/80 text-[11px] font-medium">
                  {type === 'credit' ? 'Credit Limit' : 'Available Balance'}
                </Text>
              </View>

              <Text numberOfLines={1} className="text-white text-2xl font-black tracking-tight">
                ₱ {Number(amountInput || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Bottom Row: Holder, Expiry & Last 4 */}
            <View className="flex-row items-end justify-between z-10 border-t border-white/15 pt-2.5">
              <View className="flex-1 mr-2">
                <Text numberOfLines={1} className="text-white font-bold text-xs tracking-wider">
                  {(cardholderName || 'KWARTA MEMBER').toUpperCase()}
                </Text>
                <Text className="text-white/90 text-[11px] font-mono tracking-widest mt-0.5">
                  •••• {last4 || '0000'}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-white/70 text-[9px] font-medium">
                  {network.toUpperCase()}
                </Text>
                <Text className="text-white font-mono text-[11px] font-bold">{expiry || 'MM/YY'}</Text>
              </View>
            </View>
          </View>

          {/* Error Banner */}
          {error && (
            <View className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl mb-4">
              <Text className="text-rose-400 text-xs font-medium">{error}</Text>
            </View>
          )}

          {/* ================= 2. PHILIPPINE CARD TEMPLATES ================= */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2.5">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Philippine Card Templates
              </Text>
              <View className="flex-row items-center">
                <Sparkles size={11} color="#10B981" />
                <Text className="text-emerald-400 text-[11px] font-semibold ml-1">PH Banks</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              <View className="flex-row gap-2.5 pb-1">
                {PHILIPPINE_CARD_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <Pressable
                      key={tmpl.id}
                      onPress={() => handleSelectTemplate(tmpl)}
                      style={{ backgroundColor: tmpl.primaryColor }}
                      className={`px-3.5 py-2.5 rounded-2xl border ${
                        isSelected
                          ? 'border-white scale-105 shadow-md shadow-white/20'
                          : 'border-white/20 opacity-80'
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-white font-black text-xs mr-2">{tmpl.bankName}</Text>
                        {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                      <Text className="text-white/90 text-[10px] font-medium" numberOfLines={1}>
                        {tmpl.badgeText}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ================= 3. CARD TYPE SELECTOR ================= */}
          <View className="mb-4">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Card Type
            </Text>
            <View className="flex-row bg-[#0B1220] p-1 rounded-2xl border border-slate-800">
              <Pressable
                onPress={() => setType('debit')}
                className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                  type === 'debit' ? 'bg-emerald-500/20 border border-emerald-500/40' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    type === 'debit' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  Debit Card
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setType('credit')}
                className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                  type === 'credit' ? 'bg-indigo-500/20 border border-indigo-500/40' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    type === 'credit' ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  Credit Card
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ================= 4. FORM FIELDS ================= */}
          {/* Card Name */}
          <View className="mb-4">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Card Name / Nickname
            </Text>
            <TextInput
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (error) setError(null);
              }}
              placeholder="e.g. BDO Titanium, BPI Rewards"
              placeholderTextColor="#64748B"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
            />
          </View>

          {/* Bank & Network */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Bank
              </Text>
              <TextInput
                value={bank}
                onChangeText={setBank}
                placeholder="e.g. BDO, BPI"
                placeholderTextColor="#64748B"
                className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
              />
            </View>

            <View className="w-32">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Network
              </Text>
              <View className="flex-row bg-[#0B1220] p-1 rounded-2xl border border-slate-700/80">
                <Pressable
                  onPress={() => setNetwork('Visa')}
                  className={`flex-1 py-2 rounded-xl items-center justify-center ${
                    network === 'Visa' ? 'bg-emerald-500/20 border border-emerald-500/40' : ''
                  }`}
                >
                  <Text className={`text-xs font-bold ${network === 'Visa' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Visa
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setNetwork('Mastercard')}
                  className={`flex-1 py-2 rounded-xl items-center justify-center ${
                    network === 'Mastercard' ? 'bg-indigo-500/20 border border-indigo-500/40' : ''
                  }`}
                >
                  <Text className={`text-xs font-bold ${network === 'Mastercard' ? 'text-indigo-400' : 'text-slate-400'}`}>
                    MC
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Last 4 Digits & Expiry Date */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Last 4 Digits
              </Text>
              <TextInput
                value={last4}
                onChangeText={(txt) => setLast4(txt.replace(/\D/g, '').slice(0, 4))}
                keyboardType="numeric"
                maxLength={4}
                placeholder="4821"
                placeholderTextColor="#64748B"
                className="bg-[#0B1220] text-white text-center font-mono tracking-widest px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
              />
            </View>

            <View className="flex-1">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Expiry (MM/YY)
              </Text>
              <TextInput
                value={expiry}
                onChangeText={setExpiry}
                maxLength={5}
                placeholder="08/29"
                placeholderTextColor="#64748B"
                className="bg-[#0B1220] text-white text-center font-mono tracking-wider px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
              />
            </View>
          </View>

          {/* Amount: Balance or Credit Limit */}
          <View className="mb-4">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              {type === 'credit' ? 'Credit Limit (₱ PHP)' : 'Starting Balance (₱ PHP)'}
            </Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="50000"
              placeholderTextColor="#64748B"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
            />
          </View>

          {/* Cardholder Name */}
          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Cardholder Name
            </Text>
            <TextInput
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="JUAN DELA CRUZ"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl border border-slate-700/80 text-sm focus:border-emerald-500"
            />
          </View>

          {/* Submit Action Button */}
          <Button
            title="Save Card"
            onPress={handleSubmit}
            loading={isSubmitting}
            size="md"
          />
        </ScrollView>
      </View>
    </View>
  );
}

export function AddCardModal({
  visible,
  defaultCardholderName,
  onClose,
  onSubmit,
}: AddCardModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AddCardModalContent
          defaultCardholderName={defaultCardholderName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

export default AddCardModal;
