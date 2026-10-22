/**
 * SQLite Settings Queries and Data Management for Kwarta
 */

import * as SQLite from 'expo-sqlite';
import { getDatabase } from './client';
import { seedDefaultCategories } from './migrations';

export async function getSetting(
  key: string,
  defaultValue: string = '',
  database?: SQLite.SQLiteDatabase
): Promise<string> {
  const db = database || getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?;`,
    [key]
  );
  return row?.value ?? defaultValue;
}

export async function getAllSettings(
  database?: SQLite.SQLiteDatabase
): Promise<Record<string, string>> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM settings;`
  );
  const result: Record<string, string> = {};
  for (const row of rows || []) {
    result[row.key] = row.value;
  }
  return result;
}

export async function setSetting(
  key: string,
  value: string,
  database?: SQLite.SQLiteDatabase
): Promise<void> {
  const db = database || getDatabase();
  const nowIso = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    [key, value, nowIso]
  );
}

export async function setMultipleSettings(
  settings: Record<string, string>,
  database?: SQLite.SQLiteDatabase
): Promise<void> {
  const db = database || getDatabase();
  const nowIso = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const [key, value] of Object.entries(settings)) {
      await db.runAsync(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
        [key, value, nowIso]
      );
    }
  });
}

/**
 * Safely clears all user financial data in an atomic database transaction.
 * Deletes transactions, budgets, savings entries, and savings goals.
 * Preserves default categories and resets custom categories and preferences.
 */
export async function clearAllFinancialData(
  database?: SQLite.SQLiteDatabase
): Promise<void> {
  const db = database || getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Delete savings entries first (FK to savings_goals)
    await db.execAsync(`DELETE FROM savings_entries;`);

    // 2. Delete savings goals
    await db.execAsync(`DELETE FROM savings_goals;`);

    // 3. Delete budgets
    await db.execAsync(`DELETE FROM budgets;`);

    // 4. Delete transactions
    await db.execAsync(`DELETE FROM transactions;`);

    // 5. Delete only custom categories (preserve default seeded ones)
    await db.execAsync(`DELETE FROM categories WHERE is_default = 0;`);

    // 6. Ensure default categories exist
    await seedDefaultCategories(db);

    // 7. Reset settings table (or clear all settings keys)
    await db.execAsync(`DELETE FROM settings;`);
  });
}
