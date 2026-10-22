/**
 * SQLite Budget CRUD Operations for Kwarta
 *
 * Implements parameterized queries, foreign key enforcement, and partial unique constraints.
 */

import * as SQLite from 'expo-sqlite';
import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '@/types/budget';
import { getDatabase } from './client';

export function generateBudgetId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `bg_${timestamp}_${random}`;
}

export async function insertBudget(
  input: CreateBudgetInput,
  database?: SQLite.SQLiteDatabase
): Promise<Budget> {
  const db = database || getDatabase();
  const id = generateBudgetId();
  const nowIso = new Date().toISOString();

  const amount = Math.max(1, Math.round(input.amount_centavos));
  const month = input.month.trim();
  const categoryId = input.category_id ? input.category_id.trim() : null;

  // Validate category type boundary if categoryId is provided
  if (categoryId) {
    const categoryRow = await db.getFirstAsync<{ type: string }>(
      'SELECT type FROM categories WHERE id = ?;',
      [categoryId]
    );
    if (!categoryRow) {
      throw new Error(`Category "${categoryId}" does not exist.`);
    }
    if (categoryRow.type !== 'expense') {
      throw new Error('Budgets can only be created for expense categories.');
    }
  }

  try {
    await db.runAsync(
      `INSERT INTO budgets
       (id, category_id, amount_centavos, month, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, categoryId, amount, month, nowIso, nowIso]
    );
  } catch (error: any) {
    const message = error?.message || String(error);
    if (message.includes('UNIQUE constraint failed') || message.includes('uq_budgets')) {
      if (categoryId) {
        throw new Error('A budget for this category and month already exists. Please edit the existing budget.');
      } else {
        throw new Error('An overall monthly budget for this month already exists. Please edit the existing budget.');
      }
    }
    throw error;
  }

  const inserted = await getBudgetById(id, db);
  if (!inserted) {
    throw new Error('Failed to retrieve budget after insert.');
  }
  return inserted;
}

export async function updateBudget(
  id: string,
  input: UpdateBudgetInput,
  database?: SQLite.SQLiteDatabase
): Promise<Budget> {
  const db = database || getDatabase();
  const existing = await getBudgetById(id, db);
  if (!existing) {
    throw new Error(`Budget with id "${id}" not found.`);
  }

  const nowIso = new Date().toISOString();
  const amount =
    input.amount_centavos !== undefined
      ? Math.max(1, Math.round(input.amount_centavos))
      : existing.amount_centavos;
  const month = input.month !== undefined ? input.month.trim() : existing.month;
  const categoryId =
    input.category_id !== undefined
      ? input.category_id ? input.category_id.trim() : null
      : existing.category_id;

  // Validate category type if category is being modified
  if (categoryId) {
    const categoryRow = await db.getFirstAsync<{ type: string }>(
      'SELECT type FROM categories WHERE id = ?;',
      [categoryId]
    );
    if (!categoryRow) {
      throw new Error(`Category "${categoryId}" does not exist.`);
    }
    if (categoryRow.type !== 'expense') {
      throw new Error('Budgets can only be created for expense categories.');
    }
  }

  try {
    await db.runAsync(
      `UPDATE budgets
       SET amount_centavos = ?, month = ?, category_id = ?, updated_at = ?
       WHERE id = ?;`,
      [amount, month, categoryId, nowIso, id]
    );
  } catch (error: any) {
    const message = error?.message || String(error);
    if (message.includes('UNIQUE constraint failed') || message.includes('uq_budgets')) {
      throw new Error('Another budget already exists for this category/month combination.');
    }
    throw error;
  }

  const updated = await getBudgetById(id, db);
  if (!updated) {
    throw new Error('Failed to retrieve budget after update.');
  }
  return updated;
}

export async function deleteBudget(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();
  const result = await db.runAsync(
    `DELETE FROM budgets WHERE id = ?;`,
    [id]
  );
  return result.changes > 0;
}

export async function getBudgetById(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<Budget | null> {
  const db = database || getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT b.*,
            c.name as cat_name,
            c.icon as cat_icon,
            c.color as cat_color,
            c.type as cat_type,
            c.is_default as cat_is_default
     FROM budgets b
     LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.id = ?;`,
    [id]
  );

  if (!row) return null;

  return mapBudgetRow(row);
}

export async function getBudgetsForMonth(
  month: string,
  database?: SQLite.SQLiteDatabase
): Promise<Budget[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT b.*,
            c.name as cat_name,
            c.icon as cat_icon,
            c.color as cat_color,
            c.type as cat_type,
            c.is_default as cat_is_default
     FROM budgets b
     LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.month = ?
     ORDER BY (b.category_id IS NOT NULL) ASC, b.created_at ASC;`,
    [month]
  );

  return (rows || []).map(mapBudgetRow);
}

export async function getAllBudgets(
  database?: SQLite.SQLiteDatabase
): Promise<Budget[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT b.*,
            c.name as cat_name,
            c.icon as cat_icon,
            c.color as cat_color,
            c.type as cat_type,
            c.is_default as cat_is_default
     FROM budgets b
     LEFT JOIN categories c ON b.category_id = c.id
     ORDER BY b.month DESC, (b.category_id IS NOT NULL) ASC, b.created_at ASC;`
  );

  return (rows || []).map(mapBudgetRow);
}

function mapBudgetRow(row: any): Budget {
  const category = row.cat_name
    ? {
        id: row.category_id,
        name: row.cat_name,
        icon: row.cat_icon,
        color: row.cat_color,
        type: row.cat_type,
        is_default: row.cat_is_default ?? 1,
      }
    : undefined;

  return {
    id: String(row.id),
    category_id: row.category_id ? String(row.category_id) : null,
    amount_centavos: row.amount_centavos,
    month: row.month,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category,
  };
}
