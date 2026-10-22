/**
 * Centralized SQLite Database Initialization and Management
 * Uses Expo SQLite (modern async/sync API) with WAL mode and foreign-key constraints.
 */

import * as SQLite from 'expo-sqlite';
import {
  DATABASE_NAME,
  CURRENT_SCHEMA_VERSION,
  CREATE_TABLES_SQL,
  DEFAULT_CATEGORIES,
} from './schema';
import { DatabaseInitResult } from '@/types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the active SQLite database instance.
 * Lazily creates the instance if not already initialized.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return dbInstance;
}

/**
 * Centralized database initialization with schema versioning and error handling.
 * Safe to call multiple times (idempotent).
 */
export async function initDatabase(): Promise<DatabaseInitResult> {
  try {
    const db = getDatabase();

    // 1. Enable WAL journal mode and enforce foreign keys
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    // 2. Check current schema version
    const versionRow = await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;'
    );
    const currentVersion = versionRow?.user_version ?? 0;

    // 3. Perform version migrations
    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      // Version 0 -> 1: Create initial tables and seed categories
      if (currentVersion === 0) {
        await db.execAsync(CREATE_TABLES_SQL);

        // Seed default categories if table is currently empty
        const countRow = await db.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM categories;'
        );

        if ((countRow?.count ?? 0) === 0) {
          for (const category of DEFAULT_CATEGORIES) {
            await db.runAsync(
              'INSERT INTO categories (name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?);',
              [
                category.name,
                category.icon,
                category.color,
                category.type,
                category.is_default,
              ]
            );
          }
        }

        // Set user_version to current schema version
        await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
      }
    }

    return {
      success: true,
      version: CURRENT_SCHEMA_VERSION,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Kwarta SQLite Error] Failed to initialize database:', message);
    return {
      success: false,
      error: message,
    };
  }
}
