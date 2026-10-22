/**
 * SQLite Database Operations for Kwarta Accounts & Cards
 */

import * as SQLite from 'expo-sqlite';
import { getDatabase } from './client';
import { AccountCard, CreateAccountCardInput } from '@/types/accounts';

/**
 * Ensures the account_cards table exists in SQLite.
 */
export async function ensureAccountsSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS account_cards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bank TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
      card_number_last4 TEXT NOT NULL,
      balance_centavos INTEGER NOT NULL DEFAULT 0,
      credit_limit_centavos INTEGER NULL,
      cardholder_name TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      color_primary TEXT NOT NULL,
      color_secondary TEXT NOT NULL,
      network TEXT NOT NULL DEFAULT 'Visa',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_account_cards_type ON account_cards(type);
  `);

  // Seed initial 2 default cards if empty
  await seedDefaultCards(db);
}

/**
 * Seeds initial cards (Kwarta Signature Debit and BDO/BPI Credit) if the table is empty.
 */
export async function seedDefaultCards(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM account_cards;`
  );

  if (row && row.count > 0) return;

  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO account_cards (
      id, name, bank, type, card_number_last4, balance_centavos, credit_limit_centavos,
      cardholder_name, expiry_date, color_primary, color_secondary, network, is_default,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      'card_debit_primary',
      'Kwarta Signature Debit',
      'Kwarta',
      'debit',
      '4821',
      0, // Synchronized with live cash balance
      null,
      'KWARTA MEMBER',
      '08/29',
      '#064E3B',
      '#0F766E',
      'Visa',
      1,
      now,
      now,
    ]
  );

  await db.runAsync(
    `INSERT INTO account_cards (
      id, name, bank, type, card_number_last4, balance_centavos, credit_limit_centavos,
      cardholder_name, expiry_date, color_primary, color_secondary, network, is_default,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      'card_credit_primary',
      'BPI Rewards Card',
      'BPI',
      'credit',
      '8912',
      0,
      5000000, // ₱50,000 credit limit
      'KWARTA MEMBER',
      '11/30',
      '#8A1538',
      '#4C0519',
      'Mastercard',
      0,
      now,
      now,
    ]
  );
}

/**
 * Retrieves all registered account cards ordered by default first, then newest.
 */
export async function getAllAccountCards(
  database?: SQLite.SQLiteDatabase
): Promise<AccountCard[]> {
  const db = database || getDatabase();
  const rows = await db.getAllAsync<AccountCard>(
    `SELECT * FROM account_cards ORDER BY is_default DESC, created_at ASC;`
  );
  return rows || [];
}

/**
 * Inserts a new account card.
 */
export async function insertAccountCard(
  card: CreateAccountCardInput,
  database?: SQLite.SQLiteDatabase
): Promise<AccountCard> {
  const db = database || getDatabase();
  const id = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO account_cards (
      id, name, bank, type, card_number_last4, balance_centavos, credit_limit_centavos,
      cardholder_name, expiry_date, color_primary, color_secondary, network, is_default,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      card.name.trim(),
      card.bank.trim(),
      card.type,
      card.card_number_last4.trim(),
      card.balance_centavos || 0,
      card.credit_limit_centavos ?? null,
      card.cardholder_name.trim().toUpperCase(),
      card.expiry_date.trim(),
      card.color_primary,
      card.color_secondary,
      card.network,
      card.is_default ? 1 : 0,
      now,
      now,
    ]
  );

  return {
    id,
    name: card.name.trim(),
    bank: card.bank.trim(),
    type: card.type,
    card_number_last4: card.card_number_last4.trim(),
    balance_centavos: card.balance_centavos || 0,
    credit_limit_centavos: card.credit_limit_centavos ?? null,
    cardholder_name: card.cardholder_name.trim().toUpperCase(),
    expiry_date: card.expiry_date.trim(),
    color_primary: card.color_primary,
    color_secondary: card.color_secondary,
    network: card.network,
    is_default: card.is_default ? 1 : 0,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Updates an existing account card.
 */
export async function updateAccountCard(
  id: string,
  updates: Partial<CreateAccountCardInput>,
  database?: SQLite.SQLiteDatabase
): Promise<void> {
  const db = database || getDatabase();
  const now = new Date().toISOString();

  const setClauses: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name.trim());
  }
  if (updates.bank !== undefined) {
    setClauses.push('bank = ?');
    values.push(updates.bank.trim());
  }
  if (updates.type !== undefined) {
    setClauses.push('type = ?');
    values.push(updates.type);
  }
  if (updates.card_number_last4 !== undefined) {
    setClauses.push('card_number_last4 = ?');
    values.push(updates.card_number_last4.trim());
  }
  if (updates.balance_centavos !== undefined) {
    setClauses.push('balance_centavos = ?');
    values.push(updates.balance_centavos);
  }
  if (updates.credit_limit_centavos !== undefined) {
    setClauses.push('credit_limit_centavos = ?');
    values.push(updates.credit_limit_centavos);
  }
  if (updates.cardholder_name !== undefined) {
    setClauses.push('cardholder_name = ?');
    values.push(updates.cardholder_name.trim().toUpperCase());
  }
  if (updates.expiry_date !== undefined) {
    setClauses.push('expiry_date = ?');
    values.push(updates.expiry_date.trim());
  }
  if (updates.color_primary !== undefined) {
    setClauses.push('color_primary = ?');
    values.push(updates.color_primary);
  }
  if (updates.color_secondary !== undefined) {
    setClauses.push('color_secondary = ?');
    values.push(updates.color_secondary);
  }
  if (updates.network !== undefined) {
    setClauses.push('network = ?');
    values.push(updates.network);
  }
  if (updates.is_default !== undefined) {
    setClauses.push('is_default = ?');
    values.push(updates.is_default ? 1 : 0);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE account_cards SET ${setClauses.join(', ')} WHERE id = ?;`,
    values
  );
}

/**
 * Deletes an account card.
 */
export async function deleteAccountCard(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<void> {
  const db = database || getDatabase();
  await db.runAsync(`DELETE FROM account_cards WHERE id = ?;`, [id]);
}
