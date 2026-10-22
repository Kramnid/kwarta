/**
 * Centralized SQLite Database Initialization and Management
 * Uses Expo SQLite with WAL mode, foreign-key constraints, and versioned migrations.
 */

import { CURRENT_SCHEMA_VERSION } from './schema';
import { runMigrations } from './migrations';
import { getDatabase } from './client';
import { DatabaseInitResult } from '@/types';

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

export * from './client';
export * from './schema';
export * from './migrations';
export * from './categories';
export * from './transactions';
export * from './budgets';
export * from './analytics';
export * from './savings';
