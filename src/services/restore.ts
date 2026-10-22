/**
 * Local Backup Restoration Service for Kwarta
 *
 * Implements safe, validated, and atomic database replacement inside SQLite transactions.
 * Preserves existing data completely if validation or restoration encounters any error.
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '@/database/client';
import { KwartaBackupData } from '@/types/settings';
import { useAppStore, useBudgetStore, useSavingsStore } from '@/store';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface PickBackupResult {
  success: boolean;
  content?: string;
  fileName?: string;
  error?: string;
  canceled?: boolean;
}

/**
 * Launches the system document picker to select a Kwarta backup file.
 */
export async function pickBackupFile(): Promise<PickBackupResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, canceled: true };
    }

    const asset = result.assets[0];
    const content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      success: true,
      content,
      fileName: asset.name,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to open file: ${message}`,
    };
  }
}

/**
 * Atomically replaces the current SQLite database with the validated backup data.
 * If any error occurs, rolls back cleanly and leaves current records untouched.
 */
export async function restoreBackupData(
  data: KwartaBackupData,
  database?: SQLite.SQLiteDatabase
): Promise<{ success: boolean; error?: string }> {
  const db = database || getDatabase();
  const nowIso = new Date().toISOString();

  try {
    await db.withTransactionAsync(async () => {
      // 1. Delete all existing tables in reverse relational dependency order
      await db.execAsync(`DELETE FROM savings_entries;`);
      await db.execAsync(`DELETE FROM savings_goals;`);
      await db.execAsync(`DELETE FROM budgets;`);
      await db.execAsync(`DELETE FROM transactions;`);
      await db.execAsync(`DELETE FROM categories;`);
      await db.execAsync(`DELETE FROM settings;`);

      // 2. Insert Categories
      for (const cat of data.categories) {
        await db.runAsync(
          `INSERT INTO categories (id, name, icon, color, type, is_default, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            cat.id,
            cat.name,
            cat.icon || 'tag',
            cat.color || '#10B981',
            cat.type,
            cat.is_default ?? 0,
            cat.created_at || nowIso,
          ]
        );
      }

      // 3. Insert Transactions
      for (const tx of data.transactions) {
        await db.runAsync(
          `INSERT INTO transactions
           (id, type, amount_centavos, category_id, title, note, transaction_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            tx.id,
            tx.type,
            tx.amount_centavos,
            tx.category_id,
            tx.title,
            tx.note ?? null,
            tx.transaction_date,
            tx.created_at || nowIso,
            tx.updated_at || nowIso,
          ]
        );
      }

      // 4. Insert Budgets
      for (const b of data.budgets) {
        await db.runAsync(
          `INSERT INTO budgets (id, category_id, amount_centavos, month, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            b.id,
            b.category_id ?? null,
            b.amount_centavos,
            b.month,
            b.created_at || nowIso,
            b.updated_at || nowIso,
          ]
        );
      }

      // 5. Insert Savings Goals
      for (const goal of data.savingsGoals) {
        await db.runAsync(
          `INSERT INTO savings_goals
           (id, name, target_centavos, deadline, icon, color, note, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            goal.id,
            goal.name,
            goal.target_centavos,
            goal.deadline ?? null,
            goal.icon || 'piggy-bank',
            goal.color || '#10B981',
            goal.note ?? null,
            goal.status || 'active',
            goal.created_at || nowIso,
            goal.updated_at || nowIso,
          ]
        );
      }

      // 6. Insert Savings Entries
      for (const entry of data.savingsEntries) {
        await db.runAsync(
          `INSERT INTO savings_entries
           (id, goal_id, type, amount_centavos, note, entry_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            entry.id,
            entry.goal_id,
            entry.type,
            entry.amount_centavos,
            entry.note ?? null,
            entry.entry_date,
            entry.created_at || nowIso,
          ]
        );
      }

      // 7. Insert Settings
      if (data.settings && typeof data.settings === 'object') {
        for (const [key, value] of Object.entries(data.settings)) {
          await db.runAsync(
            `INSERT INTO settings (key, value, updated_at)
             VALUES (?, ?, ?);`,
            [key, String(value), nowIso]
          );
        }
      }
    });

    // 8. Refresh all application Zustand stores so screens update reactively
    await Promise.all([
      useAppStore.getState().refreshCategories(),
      useAppStore.getState().refreshTransactions(),
      useBudgetStore.getState().refreshBudgets(),
      useSavingsStore.getState().refreshSavings(),
      useSettingsStore.getState().loadSettings(),
    ]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Kwarta Restore Error]:', message);
    return {
      success: false,
      error: `Restoration failed: ${message}. Existing data has been preserved.`,
    };
  }
}
