/**
 * SQLite Transaction CRUD Operations for Kwarta
 *
 * Implements parameterized queries, foreign key enforcement, and SQL join with categories.
 */

import * as SQLite from 'expo-sqlite';
import {
  Transaction,
  CreateTransactionInput,
} from '@/types/finance';
import { getDatabase } from './index';

export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `tx_${timestamp}_${random}`;
}

export async function insertTransaction(
  input: CreateTransactionInput,
  database?: SQLite.SQLiteDatabase
): Promise<Transaction> {
  const db = database || getDatabase();
  const id = generateTransactionId();
  const nowIso = new Date().toISOString();

  const title = input.title.trim();
  const note = input.note ? input.note.trim() : null;
  const amount = Math.max(1, Math.round(input.amount_centavos));

  await db.runAsync(
    `INSERT INTO transactions
     (id, type, amount_centavos, category_id, title, note, transaction_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      input.type,
      amount,
      input.category_id,
      title,
      note,
      input.transaction_date,
      nowIso,
      nowIso,
    ]
  );

  const inserted = await getTransactionById(id, db);
  if (!inserted) {
    throw new Error('Failed to retrieve transaction after insert.');
  }
  return inserted;
}

export async function updateTransaction(
  id: string,
  input: Partial<CreateTransactionInput>,
  database?: SQLite.SQLiteDatabase
): Promise<Transaction> {
  const db = database || getDatabase();
  const existing = await getTransactionById(id, db);
  if (!existing) {
    throw new Error(`Transaction with id "${id}" not found.`);
  }

  const nowIso = new Date().toISOString();
  const type = input.type || existing.type;
  const amount =
    input.amount_centavos !== undefined
      ? Math.max(1, Math.round(input.amount_centavos))
      : existing.amount_centavos;
  const categoryId = input.category_id || existing.category_id;
  const title = input.title !== undefined ? input.title.trim() : existing.title;
  const note =
    input.note !== undefined
      ? input.note ? input.note.trim() : null
      : existing.note ?? null;
  const transactionDate = input.transaction_date || existing.transaction_date;

  await db.runAsync(
    `UPDATE transactions
     SET type = ?, amount_centavos = ?, category_id = ?, title = ?, note = ?, transaction_date = ?, updated_at = ?
     WHERE id = ?;`,
    [type, amount, categoryId, title, note, transactionDate, nowIso, id]
  );

  const updated = await getTransactionById(id, db);
  if (!updated) {
    throw new Error('Failed to retrieve transaction after update.');
  }
  return updated;
}

export async function deleteTransaction(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();
  const result = await db.runAsync(
    `DELETE FROM transactions WHERE id = ?;`,
    [id]
  );
  return result.changes > 0;
}

export async function getTransactionById(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<Transaction | null> {
  const db = database || getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT t.*,
            c.name as cat_name,
            c.icon as cat_icon,
            c.color as cat_color,
            c.type as cat_type,
            c.is_default as cat_is_default
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = ?;`,
    [id]
  );

  if (!row) return null;

  return mapTransactionRow(row);
}

export async function getAllTransactions(
  database?: SQLite.SQLiteDatabase
): Promise<Transaction[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT t.*,
            c.name as cat_name,
            c.icon as cat_icon,
            c.color as cat_color,
            c.type as cat_type,
            c.is_default as cat_is_default
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     ORDER BY t.transaction_date DESC, t.id DESC;`
  );

  return (rows || []).map(mapTransactionRow);
}

function mapTransactionRow(row: any): Transaction {
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
    type: row.type,
    amount_centavos: row.amount_centavos,
    amount: row.amount_centavos, // alias
    category_id: String(row.category_id),
    title: row.title,
    description: row.title, // alias
    note: row.note,
    transaction_date: row.transaction_date,
    date: row.transaction_date, // alias
    created_at: row.created_at,
    updated_at: row.updated_at,
    category,
  };
}
