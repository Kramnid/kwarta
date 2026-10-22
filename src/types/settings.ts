/**
 * Settings and Data Management Type Definitions for Kwarta
 */

import { TransactionCategory } from './finance';

export type AppearanceMode = 'system' | 'dark' | 'light';
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface AppSettings {
  displayName: string;
  profileInitials: string;
  appearance: AppearanceMode;
  currency: string;
  dateFormat: DateFormatOption;
  isAppLockEnabled: boolean;
}

export interface CreateCategoryInput {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}

export interface CategoryUsageCheck {
  inUse: boolean;
  transactionCount: number;
  budgetCount: number;
  message?: string;
}

export interface KwartaBackupData {
  categories: TransactionCategory[];
  transactions: any[];
  budgets: any[];
  savingsGoals: any[];
  savingsEntries: any[];
  settings: Record<string, string>;
}

export interface KwartaBackupFile {
  app: 'Kwarta';
  backupVersion: 1;
  createdAt: string;
  data: KwartaBackupData;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  summary?: {
    transactionsCount: number;
    categoriesCount: number;
    budgetsCount: number;
    savingsGoalsCount: number;
    savingsEntriesCount: number;
    createdAt: string;
  };
  parsedData?: KwartaBackupFile;
}
