import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Database, AlertTriangle, X } from 'lucide-react-native';
import { BackupValidationResult } from '@/types/settings';
import { formatTransactionDate } from '@/utils/date';

interface BackupSummaryModalProps {
  visible: boolean;
  validation: BackupValidationResult | null;
  fileName?: string;
  isRestoring?: boolean;
  onCancel: () => void;
  onConfirmRestore: () => void;
}

export function BackupSummaryModal({
  visible,
  validation,
  fileName,
  isRestoring = false,
  onCancel,
  onConfirmRestore,
}: BackupSummaryModalProps) {
  if (!validation || !validation.summary) return null;

  const { summary } = validation;
  const formattedDate = summary.createdAt
    ? formatTransactionDate(summary.createdAt)
    : 'Unknown Date';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/75 justify-end">
        <View className="bg-[#151F30] rounded-t-3xl p-6 border-t border-slate-700/80 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mr-3 shadow-sm">
                <Database size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">
                  Backup Summary
                </Text>
                <Text numberOfLines={1} className="text-slate-400 text-xs mt-0.5">
                  {fileName || 'kwarta-backup.json'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onCancel}
              disabled={isRestoring}
              className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center border border-slate-700 active:bg-slate-700"
            >
              <X size={16} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Backup Metrics Grid */}
          <View className="bg-[#0B1220] p-4 rounded-2xl border border-slate-800 mb-4">
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <Text className="text-slate-400 text-xs font-medium">Backup Created</Text>
              <Text className="text-white text-xs font-bold">{formattedDate}</Text>
            </View>

            <View className="grid grid-cols-2 gap-3">
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-slate-400 text-xs">Transactions</Text>
                <Text className="text-emerald-400 text-xs font-bold">
                  {summary.transactionsCount}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-1">
                <Text className="text-slate-400 text-xs">Categories</Text>
                <Text className="text-white text-xs font-bold">
                  {summary.categoriesCount}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-1">
                <Text className="text-slate-400 text-xs">Budgets</Text>
                <Text className="text-white text-xs font-bold">
                  {summary.budgetsCount}
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-1">
                <Text className="text-slate-400 text-xs">Savings Goals</Text>
                <Text className="text-white text-xs font-bold">
                  {summary.savingsGoalsCount} ({summary.savingsEntriesCount} entries)
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Banner */}
          <View className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex-row items-start mb-6">
            <AlertTriangle size={18} color="#FBBF24" style={{ marginTop: 2, marginRight: 10 }} />
            <Text className="text-amber-200 text-xs leading-5 flex-1">
              Restoring will <Text className="font-bold underline">replace all current data</Text> on this device. Existing records will be overwritten.
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={isRestoring}
              className="flex-1 bg-slate-800 active:bg-slate-700 py-3.5 rounded-2xl items-center justify-center border border-slate-700"
            >
              <Text className="text-slate-300 font-semibold text-sm">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirmRestore}
              disabled={isRestoring}
              className="flex-1 bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-2xl items-center justify-center shadow-sm"
            >
              {isRestoring ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">Replace & Restore</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BackupSummaryModal;
