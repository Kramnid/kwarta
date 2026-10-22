import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore, useSettingsStore } from '@/store';
import { exportTransactionsToCsv } from '@/services/csvExport';
import { createDatabaseBackup } from '@/services/backup';
import { pickBackupFile, restoreBackupData } from '@/services/restore';
import { validateBackupData } from '@/utils/backupValidation';
import { BackupValidationResult } from '@/types/settings';
import {
  SettingsSection,
  SettingsRow,
  BackupSummaryModal,
  DestructiveActionDialog,
} from '@/components/settings';

export default function BackupManagementScreen() {
  const router = useRouter();
  const { transactions } = useAppStore();
  const { resetAllData } = useSettingsStore();

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isPickingBackup, setIsPickingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Restore Modal State
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [backupFileName, setBackupFileName] = useState<string>('');

  // Clear All Data State
  const [clearDataModalVisible, setClearDataModalVisible] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // 1. Export Transactions CSV
  const handleExportCsv = async () => {
    if (transactions.length === 0) {
      Alert.alert('No Transactions', 'You have no transactions to export yet. Log a transaction first.');
      return;
    }

    setIsExportingCsv(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await exportTransactionsToCsv();
      if (!res.success) {
        Alert.alert('Export Failed', res.error || 'Could not export CSV file.');
      } else {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 2. Create JSON Backup
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await createDatabaseBackup();
      if (!res.success) {
        Alert.alert('Backup Failed', res.error || 'Could not generate backup file.');
      } else {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // 3. Pick and Validate Backup File
  const handlePickBackup = async () => {
    setIsPickingBackup(true);
    try {
      const pickRes = await pickBackupFile();
      if (pickRes.canceled || !pickRes.content) {
        return;
      }

      const validation = validateBackupData(pickRes.content);
      if (!validation.isValid) {
        Alert.alert('Invalid Backup File', validation.error || 'The selected file is not a valid Kwarta backup.');
        return;
      }

      setValidationResult(validation);
      setBackupFileName(pickRes.fileName || 'kwarta-backup.json');
      setSummaryModalVisible(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Error Reading File', msg);
    } finally {
      setIsPickingBackup(false);
    }
  };

  // 4. Confirm and Restore Backup
  const handleConfirmRestore = async () => {
    if (!validationResult || !validationResult.parsedData) return;

    setIsRestoring(true);
    try {
      const res = await restoreBackupData(validationResult.parsedData.data);
      if (!res.success) {
        Alert.alert('Restore Failed', res.error || 'Could not restore backup.');
      } else {
        setSummaryModalVisible(false);
        setValidationResult(null);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        Alert.alert(
          'Restore Complete',
          'Your backup has been successfully restored. All screens have been updated.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)' as any) }]
        );
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // 5. Clear All Financial Data
  const handleConfirmClearAll = async () => {
    setIsClearingData(true);
    try {
      await resetAllData();
      // Also refresh app store collections
      await Promise.all([
        useAppStore.getState().refreshCategories(),
        useAppStore.getState().refreshTransactions(),
      ]);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setClearDataModalVisible(false);
      Alert.alert(
        'Data Cleared',
        'All transactions, budgets, savings goals, and custom categories have been permanently reset.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)' as any) }]
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert('Failed to Clear Data', msg);
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#0B1220]">
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center border-b border-slate-800/80">
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
            Data Management
          </Text>
          <Text className="text-slate-400 text-xs">
            Export, backup, and restore
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#0B1220]"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Note */}
        <View className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl flex-row items-start mb-5">
          <ShieldAlert size={18} color="#FBBF24" style={{ marginTop: 2, marginRight: 10 }} />
          <Text className="text-slate-300 text-xs leading-5 flex-1">
            <Text className="text-amber-300 font-bold">Privacy Notice:</Text> Exported CSV and JSON backups contain unencrypted records of your transactions and balances. Save them in a secure personal folder.
          </Text>
        </View>

        {/* 1. Transaction Export Section */}
        <SettingsSection title="Spreadsheet Export">
          <SettingsRow
            icon={<FileSpreadsheet size={18} color="#10B981" />}
            title="Export Transactions (CSV)"
            subtitle={`Generate RFC-compliant spreadsheet with UTF-8 BOM (${transactions.length} records)`}
            onPress={handleExportCsv}
            disabled={isExportingCsv}
            rightElement={
              isExportingCsv ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : undefined
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* 2. Full Local Backup Section */}
        <SettingsSection title="Local Snapshot Backup">
          <SettingsRow
            icon={<Download size={18} color="#38BDF8" />}
            iconBgColor="bg-sky-500/15 border-sky-500/30"
            title="Create JSON Backup"
            subtitle="Save complete database snapshot (categories, transactions, budgets, goals)"
            onPress={handleCreateBackup}
            disabled={isCreatingBackup}
            rightElement={
              isCreatingBackup ? (
                <ActivityIndicator size="small" color="#38BDF8" />
              ) : undefined
            }
            showDivider
          />

          <SettingsRow
            icon={<Upload size={18} color="#F59E0B" />}
            iconBgColor="bg-amber-500/15 border-amber-500/30"
            title="Restore from Backup"
            subtitle="Choose a Kwarta backup file to validate and restore"
            onPress={handlePickBackup}
            disabled={isPickingBackup}
            rightElement={
              isPickingBackup ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : undefined
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* 3. Destructive Action: Clear All Data */}
        <SettingsSection title="Danger Zone">
          <SettingsRow
            icon={<Trash2 size={18} color="#F87171" />}
            iconBgColor="bg-rose-500/15 border-rose-500/30"
            title="Clear All Financial Data"
            subtitle="Permanently erase transactions, budgets, and savings goals from this device"
            destructive
            onPress={() => setClearDataModalVisible(true)}
            showDivider={false}
          />
        </SettingsSection>
      </ScrollView>

      {/* Restore Confirmation Summary Modal */}
      <BackupSummaryModal
        visible={summaryModalVisible}
        validation={validationResult}
        fileName={backupFileName}
        isRestoring={isRestoring}
        onCancel={() => {
          setSummaryModalVisible(false);
          setValidationResult(null);
        }}
        onConfirmRestore={handleConfirmRestore}
      />

      {/* Clear All Data Confirmation Dialog */}
      <DestructiveActionDialog
        visible={clearDataModalVisible}
        title="Permanently Clear All Data?"
        message="This action cannot be undone. All your transactions, budgets, savings goals, entries, and custom categories will be completely erased."
        confirmPhrase="CLEAR"
        confirmText="Clear Everything"
        isDestructive={true}
        isLoading={isClearingData}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setClearDataModalVisible(false)}
      />
    </SafeAreaView>
  );
}
