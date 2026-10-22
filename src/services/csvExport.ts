/**
 * Offline CSV Transaction Export Service for Kwarta
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getAllTransactions, getAllCategories } from '@/database';
import { generateTransactionsCsv } from '@/utils/csv';
import { getTodayLocalDate } from '@/utils/date';
import { Transaction, TransactionCategory } from '@/types/finance';

export interface ExportCsvResult {
  success: boolean;
  count: number;
  fileUri?: string;
  fileName?: string;
  error?: string;
}

/**
 * Exports all transactions to a CSV file and opens the device sharing sheet.
 */
export async function exportTransactionsToCsv(
  providedTransactions?: Transaction[]
): Promise<ExportCsvResult> {
  try {
    let transactions = providedTransactions;
    if (!transactions) {
      transactions = await getAllTransactions();
    }

    if (transactions.length === 0) {
      return {
        success: false,
        count: 0,
        error: 'No transactions found to export.',
      };
    }

    // Load categories to ensure proper category mapping
    const categories = await getAllCategories();
    const categoriesMap = new Map<string, TransactionCategory>();
    for (const cat of categories) {
      categoriesMap.set(cat.id, cat);
    }

    const csvContent = generateTransactionsCsv(transactions, categoriesMap);
    const todayStr = getTodayLocalDate();
    const fileName = `kwarta-transactions-${todayStr}.csv`;

    const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    if (!targetDir) {
      throw new Error('Device storage directory is not accessible.');
    }

    const fileUri = `${targetDir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Kwarta Transactions',
        UTI: 'public.comma-separated-values-text',
      });
    }

    return {
      success: true,
      count: transactions.length,
      fileUri,
      fileName,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Kwarta CSV Export Error]:', message);
    return {
      success: false,
      count: 0,
      error: message,
    };
  }
}
