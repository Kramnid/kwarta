/**
 * SQLite Analytics Aggregation Queries for Kwarta
 *
 * Implements parameterized SQL aggregation directly on SQLite.
 * Uses integer centavos for all sums and group-bys.
 */

import * as SQLite from 'expo-sqlite';
import { getDatabase } from './client';

export interface DbPeriodTotals {
  totalIncomeCentavos: number;
  totalExpensesCentavos: number;
}

export interface DbCategorySpendingRow {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_centavos: number;
}

/**
 * Returns total income and expenses for a date range via SQL SUM.
 */
export async function getDbPeriodTotals(
  startDate: string,
  endDate: string,
  database?: SQLite.SQLiteDatabase
): Promise<DbPeriodTotals> {
  const db = database || getDatabase();

  const rows = await db.getAllAsync<{ type: string; total: number }>(
    `SELECT type, SUM(amount_centavos) as total
     FROM transactions
     WHERE transaction_date >= ? AND transaction_date <= ?
     GROUP BY type;`,
    [startDate, endDate]
  );

  let totalIncomeCentavos = 0;
  let totalExpensesCentavos = 0;

  for (const row of rows || []) {
    if (row.type === 'income') {
      totalIncomeCentavos = row.total || 0;
    } else if (row.type === 'expense') {
      totalExpensesCentavos = row.total || 0;
    }
  }

  return {
    totalIncomeCentavos,
    totalExpensesCentavos,
  };
}

/**
 * Aggregates expense transactions by category for a date range directly in SQLite.
 */
export async function getDbCategorySpending(
  startDate: string,
  endDate: string,
  database?: SQLite.SQLiteDatabase
): Promise<DbCategorySpendingRow[]> {
  const db = database || getDatabase();

  const rows = await db.getAllAsync<DbCategorySpendingRow>(
    `SELECT t.category_id,
            COALESCE(c.name, 'Other') as category_name,
            COALESCE(c.icon, 'ellipsis') as category_icon,
            COALESCE(c.color, '#94A3B8') as category_color,
            SUM(t.amount_centavos) as total_centavos
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense'
       AND t.transaction_date >= ?
       AND t.transaction_date <= ?
     GROUP BY t.category_id
     ORDER BY total_centavos DESC;`,
    [startDate, endDate]
  );

  return rows || [];
}
