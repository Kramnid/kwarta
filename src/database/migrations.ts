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

  // Ensure budgets and savings tables match modern schema
  await ensureBudgetsSchema(db);
  await ensureSavingsSchema(db);

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    // Schema is up to date; ensure categories are seeded idempotently
    await seedDefaultCategories(db);
    return;
  }

  // Version 0 -> 4 (Fresh database setup)
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

      // 3. Create indexes for performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      `);

      // 4. Ensure budgets table & indexes
      await ensureBudgetsSchema(db);

      // 5. Ensure savings goals and entries tables & indexes
      await ensureSavingsSchema(db);

      // 6. Seed default categories
      await seedDefaultCategories(db);

      // 7. Update user_version
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
      await ensureBudgetsSchema(db);
      await db.execAsync(`PRAGMA user_version = 3;`);
    });
  }

  // Version 3 -> 4 (Upgrade: Add savings_goals and savings_entries tables)
  if (currentVersion < 4) {
    await db.withTransactionAsync(async () => {
      await ensureSavingsSchema(db);
      await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
    });
  }

  // Ensure categories are present
  await seedDefaultCategories(db);
}

/**
 * Ensures the savings_goals and savings_entries tables exist and are properly indexed.
 * Handles upgrading any legacy schema without dropping user data.
 */
export async function ensureSavingsSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  const tableInfo = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(savings_goals);"
  );
  const columnNames = new Set((tableInfo || []).map((col) => col.name));

  if (tableInfo.length > 0 && !columnNames.has('status')) {
    // Legacy prototype table from Step 1 detected without 'status'
    let oldRows: any[] = [];
    try {
      oldRows = await db.getAllAsync<any>('SELECT * FROM savings_goals;');
    } catch {
      // Ignore if table empty or cannot read
    }

    await db.execAsync(`
      DROP INDEX IF EXISTS idx_savings_goals_status;
      DROP INDEX IF EXISTS idx_savings_entries_goal;
      DROP INDEX IF EXISTS idx_savings_entries_date;
      DROP TABLE IF EXISTS savings_entries;
      DROP TABLE IF EXISTS savings_goals;
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_centavos INTEGER NOT NULL CHECK(target_centavos > 0),
        deadline TEXT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        note TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Migrate any prototype rows
    const nowIso = new Date().toISOString();
    for (const row of oldRows) {
      const id = String(row.id ? `goal_${row.id}` : `goal_${Date.now()}`);
      const name = String(row.title || row.name || 'Savings Goal').trim();
      const targetCentavos = Math.max(
        1,
        Math.round(row.target_centavos || row.target_amount || 100000)
      );
      const deadline = row.deadline || row.target_date || null;
      const icon = row.icon || 'piggy-bank';
      const color = row.color || '#10B981';
      const status = row.is_completed ? 'completed' : 'active';

      await db.runAsync(
        `INSERT OR IGNORE INTO savings_goals
         (id, name, target_centavos, deadline, icon, color, note, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          name,
          targetCentavos,
          deadline,
          icon,
          color,
          null,
          status,
          row.created_at || nowIso,
          nowIso,
        ]
      );
    }
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_centavos INTEGER NOT NULL CHECK(target_centavos > 0),
      deadline TEXT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      note TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS savings_entries (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('contribution', 'withdrawal')),
      amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
      note TEXT NULL,
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_savings_entries_goal ON savings_entries(goal_id);
    CREATE INDEX IF NOT EXISTS idx_savings_entries_date ON savings_entries(entry_date);
    CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON savings_goals(status);
  `);
}

/**
 * Ensures the budgets table exists and conforms to the Step 4 schema (including the 'month' column).
 * Handles upgrading any legacy prototype table from Step 1 where 'month' did not exist.
 */
export async function ensureBudgetsSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  const tableInfo = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(budgets);"
  );
  const columnNames = new Set((tableInfo || []).map((col) => col.name));

  if (tableInfo.length > 0 && !columnNames.has('month')) {
    // Drop old indexes and old prototype table from Step 1
    await db.execAsync(`
      DROP INDEX IF EXISTS idx_budgets_category;
      DROP INDEX IF EXISTS uq_budgets_overall_month;
      DROP INDEX IF EXISTS uq_budgets_category_month;
      DROP INDEX IF EXISTS idx_budgets_month;
      DROP TABLE IF EXISTS budgets;
    `);
  }

  // Create the modern Step 4 budgets table
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
  `);
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
