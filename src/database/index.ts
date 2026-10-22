/**
 * Centralized SQLite Database Initialization and Management
 * Uses Expo SQLite with WAL mode, foreign-key constraints, and versioned migrations.
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, CURRENT_SCHEMA_VERSION } from './schema';
import { runMigrations } from './migrations';
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
    await runMigrations(db);

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

export * from './schema';
export * from './migrations';
export * from './categories';
export * from './transactions';
