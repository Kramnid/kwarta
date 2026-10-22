/**
 * Local JSON Backup Creation Service for Kwarta
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '@/database/client';
import { KwartaBackupFile } from '@/types/settings';
import { TransactionCategory } from '@/types/finance';

export interface CreateBackupResult {
  success: boolean;
  fileUri?: string;
  fileName?: string;
  backup?: KwartaBackupFile;
  error?: string;
}

/**
 * Creates a complete SQLite database snapshot in standardized Kwarta v1 JSON backup format.
 */
export async function createDatabaseBackup(
  database?: SQLite.SQLiteDatabase
): Promise<CreateBackupResult> {
  const db = database || getDatabase();

  try {
    // 1. Fetch all collections in a read-consistent snapshot
    const [
      categories,
      transactions,
      budgets,
      savingsGoals,
      savingsEntries,
      settingsRows,
    ] = await Promise.all([
      db.getAllAsync<TransactionCategory>(`SELECT * FROM categories ORDER BY name ASC;`),
      db.getAllAsync<any>(`SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC;`),
      db.getAllAsync<any>(`SELECT * FROM budgets ORDER BY month DESC;`),
      db.getAllAsync<any>(`SELECT * FROM savings_goals ORDER BY created_at DESC;`),
      db.getAllAsync<any>(`SELECT * FROM savings_entries ORDER BY entry_date DESC, created_at DESC;`),
      db.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM settings;`),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows || []) {
      settingsMap[row.key] = row.value;
    }

    const createdAt = new Date().toISOString();
    const backup: KwartaBackupFile = {
      app: 'Kwarta',
      backupVersion: 1,
      createdAt,
      data: {
        categories: categories || [],
        transactions: transactions || [],
        budgets: budgets || [],
        savingsGoals: savingsGoals || [],
        savingsEntries: savingsEntries || [],
        settings: settingsMap,
      },
    };

    // 2. Format JSON string with 2 spaces for human inspectability
    const jsonString = JSON.stringify(backup, null, 2);

    // 3. Write file locally
    const dateStamp = createdAt.replace(/[:.]/g, '-').split('T');
    const fileName = `kwarta-backup-${dateStamp[0]}-${dateStamp[1].slice(0, 8)}.json`;
    const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;

    if (!targetDir) {
      throw new Error('Device storage directory is not accessible.');
    }

    const fileUri = `${targetDir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // 4. Offer native share dialog if available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Kwarta Backup',
        UTI: 'public.json',
      });
    }

    return {
      success: true,
      fileUri,
      fileName,
      backup,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Kwarta Backup Error]:', message);
    return {
      success: false,
      error: message,
    };
  }
}
