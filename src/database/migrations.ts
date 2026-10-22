/**
 * Database Migrations and Schema Initialization for Kwarta
 *
 * Implements versioned migrations with PRAGMA user_version.
 * Multi-step operations are wrapped in SQLite transactions.
 */

import * as SQLite from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, DEFAULT_CATEGORIES } from './schema';

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Always enforce foreign keys and WAL mode
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // Check current schema version
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    // Schema is up to date; ensure categories are seeded idempotently
    await seedDefaultCategories(db);
    return;
  }

  // Version 0 -> 3 (Fresh database setup)
  if (currentVersion === 0) {
    await db.withTransactionAsync(async () => {
      // 1. Create categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          is_default INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);

      // 2. Create transactions table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
          category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
          title TEXT NOT NULL,
          note TEXT,
          transaction_date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 3. Create budgets table (Step 4)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY,
          category_id TEXT NULL REFERENCES categories(id) ON DELETE CASCADE,
          amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
          month TEXT NOT NULL CHECK(length(month) = 7),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 4. Create indexes for performance and constraints
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_overall_month ON budgets(month) WHERE category_id IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_category_month ON budgets(category_id, month) WHERE category_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
        CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
      `);

      // 5. Seed default categories
      await seedDefaultCategories(db);

      // 6. Update user_version
      await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
    });
    return;
  }

  // Version 1 -> 2 (Upgrade from Step 1 prototype schema)
  if (currentVersion === 1) {
    await db.withTransactionAsync(async () => {
      // Create modern v2 tables
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories_v2 (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          is_default INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions_v2 (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
          category_id TEXT NOT NULL REFERENCES categories_v2(id) ON DELETE RESTRICT,
          title TEXT NOT NULL,
          note TEXT,
          transaction_date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // Seed categories in v2
      const nowIso = new Date().toISOString();
      for (const cat of DEFAULT_CATEGORIES) {
        await db.runAsync(
          `INSERT OR IGNORE INTO categories_v2 (id, name, icon, color, type, is_default, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [cat.id, cat.name, cat.icon, cat.color, cat.type, 1, nowIso]
        );
      }

      // Check if old transactions exist and copy them over safely
      try {
        const oldRows = await db.getAllAsync<{
          id: number;
          amount: number;
          type: string;
          category_id: number;
          description?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        }>('SELECT * FROM transactions;');

        for (const row of oldRows) {
          const newId = `tx_migrated_${row.id}`;
          const catId =
            row.type === 'income' ? 'cat_inc_salary' : 'cat_exp_food_drinks';
          const title = (row.description || 'Migrated Transaction').trim();
          const txDate = (row.date || nowIso).split('T')[0];

          await db.runAsync(
            `INSERT OR IGNORE INTO transactions_v2
             (id, type, amount_centavos, category_id, title, note, transaction_date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              newId,
              row.type,
              Math.max(1, row.amount || 1),
              catId,
              title,
              null,
              txDate,
              row.created_at || nowIso,
              row.updated_at || nowIso,
            ]
          );
        }
      } catch {
        // Old transactions table didn't exist or was empty
      }

      // Swap tables
      await db.execAsync(`
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS categories;

        ALTER TABLE categories_v2 RENAME TO categories;
        ALTER TABLE transactions_v2 RENAME TO transactions;

        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

        PRAGMA user_version = 2;
      `);
    });
  }

  // Version 2 -> 3 (Upgrade: Add budgets table and unique indexes)
  if (currentVersion < 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY,
          category_id TEXT NULL REFERENCES categories(id) ON DELETE CASCADE,
          amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
          month TEXT NOT NULL CHECK(length(month) = 7),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_overall_month ON budgets(month) WHERE category_id IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_category_month ON budgets(category_id, month) WHERE category_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
        CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);

        PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};
      `);
    });
  }

  // Ensure categories are present
  await seedDefaultCategories(db);
}

/**
 * Idempotently seeds default categories into the categories table.
 */
export async function seedDefaultCategories(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  const nowIso = new Date().toISOString();
  for (const cat of DEFAULT_CATEGORIES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, icon, color, type, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [cat.id, cat.name, cat.icon, cat.color, cat.type, 1, nowIso]
    );
  }
}
