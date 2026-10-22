/**
 * SQLite Category Queries for Kwarta
 */

import * as SQLite from 'expo-sqlite';
import { TransactionCategory, TransactionType } from '@/types/finance';
import { getDatabase } from './index';

export async function getAllCategories(
  database?: SQLite.SQLiteDatabase
): Promise<TransactionCategory[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<TransactionCategory>(
    `SELECT * FROM categories ORDER BY type ASC, name ASC;`
  );
  return rows || [];
}

export async function getCategoriesByType(
  type: TransactionType,
  database?: SQLite.SQLiteDatabase
): Promise<TransactionCategory[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<TransactionCategory>(
    `SELECT * FROM categories WHERE type = ? ORDER BY name ASC;`,
    [type]
  );
  return rows || [];
}

export async function getCategoryById(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<TransactionCategory | null> {
  const db = database || getDatabase();
  const row = await db.getFirstAsync<TransactionCategory>(
    `SELECT * FROM categories WHERE id = ?;`,
    [id]
  );
  return row || null;
}
