/**
 * SQLite Database Connection Client for Kwarta
 *
 * Centralizes the active SQLite database instance connection to prevent
 * circular dependency cycles between index.ts and query modules.
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from './schema';

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
