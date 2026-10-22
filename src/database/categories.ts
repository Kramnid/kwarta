/**
 * SQLite Category Queries and Management for Kwarta
 */

import * as SQLite from 'expo-sqlite';
import { TransactionCategory, TransactionType } from '@/types/finance';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryUsageCheck,
} from '@/types/settings';
import { getDatabase } from './client';

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

/**
 * Checks if a category name already exists within the same transaction type.
 * Uses case-insensitive trimmed normalized comparison.
 */
export async function checkCategoryNameExists(
  name: string,
  type: 'income' | 'expense',
  excludeId?: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();
  const normalized = name.trim().toLowerCase();

  let query = `SELECT COUNT(*) as count FROM categories WHERE LOWER(TRIM(name)) = ? AND type = ?`;
  const params: (string | number)[] = [normalized, type];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const row = await db.getFirstAsync<{ count: number }>(query, params);
  return (row?.count ?? 0) > 0;
}

/**
 * Checks whether a category is currently referenced by transactions or budgets.
 */
export async function checkCategoryUsage(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<CategoryUsageCheck> {
  const db = database || getDatabase();

  const [txRow, budgetRow] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions WHERE category_id = ?;`,
      [id]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM budgets WHERE category_id = ?;`,
      [id]
    ),
  ]);

  const transactionCount = txRow?.count ?? 0;
  const budgetCount = budgetRow?.count ?? 0;
  const inUse = transactionCount > 0 || budgetCount > 0;

  let message = '';
  if (inUse) {
    const parts = [];
    if (transactionCount > 0) {
      parts.push(`${transactionCount} transaction${transactionCount === 1 ? '' : 's'}`);
    }
    if (budgetCount > 0) {
      parts.push(`${budgetCount} budget${budgetCount === 1 ? '' : 's'}`);
    }
    message = `This category is currently in use by ${parts.join(' and ')}. Reassign or delete them first before removing this category.`;
  }

  return {
    inUse,
    transactionCount,
    budgetCount,
    message,
  };
}

/**
 * Creates a new custom category.
 */
export async function insertCategory(
  input: CreateCategoryInput,
  database?: SQLite.SQLiteDatabase
): Promise<TransactionCategory> {
  const db = database || getDatabase();
  const name = input.name.trim();

  if (!name) {
    throw new Error('Category name is required.');
  }
  if (name.length > 50) {
    throw new Error('Category name cannot exceed 50 characters.');
  }

  const exists = await checkCategoryNameExists(name, input.type, undefined, db);
  if (exists) {
    throw new Error(
      `A ${input.type} category named "${name}" already exists.`
    );
  }

  const id = `cat_cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO categories (id, name, icon, color, type, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?);`,
    [id, name, input.icon || 'tag', input.color || '#10B981', input.type, nowIso]
  );

  return {
    id,
    name,
    icon: input.icon || 'tag',
    color: input.color || '#10B981',
    type: input.type,
    is_default: 0,
    created_at: nowIso,
  };
}

/**
 * Updates an existing custom category.
 */
export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  database?: SQLite.SQLiteDatabase
): Promise<TransactionCategory> {
  const db = database || getDatabase();
  const existing = await getCategoryById(id, db);

  if (!existing) {
    throw new Error('Category not found.');
  }

  let newName = existing.name;
  if (input.name !== undefined) {
    newName = input.name.trim();
    if (!newName) {
      throw new Error('Category name cannot be empty.');
    }
    if (newName.length > 50) {
      throw new Error('Category name cannot exceed 50 characters.');
    }

    const exists = await checkCategoryNameExists(
      newName,
      existing.type,
      id,
      db
    );
    if (exists) {
      throw new Error(
        `A ${existing.type} category named "${newName}" already exists.`
      );
    }
  }

  const newIcon = input.icon ?? existing.icon;
  const newColor = input.color ?? existing.color;

  await db.runAsync(
    `UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?;`,
    [newName, newIcon, newColor, id]
  );

  return {
    ...existing,
    name: newName,
    icon: newIcon,
    color: newColor,
  };
}

/**
 * Deletes a custom category if it is not a default category and not in use.
 */
export async function deleteCategory(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();
  const existing = await getCategoryById(id, db);

  if (!existing) {
    throw new Error('Category not found.');
  }

  if (existing.is_default === 1) {
    throw new Error('Default system categories cannot be deleted.');
  }

  const usage = await checkCategoryUsage(id, db);
  if (usage.inUse) {
    throw new Error(usage.message || 'Cannot delete category currently in use.');
  }

  await db.runAsync(`DELETE FROM categories WHERE id = ?;`, [id]);
  return true;
}
