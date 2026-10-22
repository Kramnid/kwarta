/**
 * SQLite Savings Goals CRUD Operations for Kwarta
 *
 * Implements parameterized queries, foreign key enforcement, transaction wrappers,
 * and accurate integer centavos tracking for savings allocations.
 */

import * as SQLite from 'expo-sqlite';
import {
  SavingsGoal,
  SavingsEntry,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateSavingsEntryInput,
  SavingsGoalStatus,
} from '@/types/savings';
import { getDatabase } from './client';
import { formatCentavosToPhp } from '@/utils/currency';

export function generateGoalId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `goal_${timestamp}_${random}`;
}

export function generateEntryId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `entry_${timestamp}_${random}`;
}

interface RawGoalRow {
  id: string;
  name: string;
  target_centavos: number;
  deadline: string | null;
  icon: string;
  color: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  allocated_centavos: number;
}

/**
 * Maps raw database row to SavingsGoal.
 */
function mapGoalRow(row: RawGoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    target_centavos: row.target_centavos,
    deadline: row.deadline || null,
    icon: row.icon,
    color: row.color,
    note: row.note || null,
    status: (row.status as SavingsGoalStatus) || 'active',
    created_at: row.created_at,
    updated_at: row.updated_at,
    allocated_centavos: row.allocated_centavos ?? 0,
  };
}

/**
 * Retrieves all savings goals along with their current allocated amounts.
 * Ordered with active first, completed second, archived last.
 */
export async function getAllSavingsGoals(
  database?: SQLite.SQLiteDatabase
): Promise<SavingsGoal[]> {
  const db = database || getDatabase();

  const query = `
    SELECT
      g.id,
      g.name,
      g.target_centavos,
      g.deadline,
      g.icon,
      g.color,
      g.note,
      g.status,
      g.created_at,
      g.updated_at,
      COALESCE(SUM(
        CASE
          WHEN e.type = 'contribution' THEN e.amount_centavos
          WHEN e.type = 'withdrawal' THEN -e.amount_centavos
          ELSE 0
        END
      ), 0) AS allocated_centavos
    FROM savings_goals g
    LEFT JOIN savings_entries e ON g.id = e.goal_id
    GROUP BY g.id
    ORDER BY
      CASE
        WHEN g.status = 'active' THEN 0
        WHEN g.status = 'completed' THEN 1
        ELSE 2
      END ASC,
      g.created_at DESC;
  `;

  const rows = await db.getAllAsync<RawGoalRow>(query);
  return rows.map(mapGoalRow);
}

/**
 * Retrieves a single savings goal by ID.
 */
export async function getSavingsGoalById(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<SavingsGoal | null> {
  const db = database || getDatabase();

  const query = `
    SELECT
      g.id,
      g.name,
      g.target_centavos,
      g.deadline,
      g.icon,
      g.color,
      g.note,
      g.status,
      g.created_at,
      g.updated_at,
      COALESCE(SUM(
        CASE
          WHEN e.type = 'contribution' THEN e.amount_centavos
          WHEN e.type = 'withdrawal' THEN -e.amount_centavos
          ELSE 0
        END
      ), 0) AS allocated_centavos
    FROM savings_goals g
    LEFT JOIN savings_entries e ON g.id = e.goal_id
    WHERE g.id = ?
    GROUP BY g.id;
  `;

  const row = await db.getFirstAsync<RawGoalRow>(query, [id]);
  return row ? mapGoalRow(row) : null;
}

/**
 * Inserts a new savings goal into the database.
 */
export async function insertSavingsGoal(
  input: CreateSavingsGoalInput,
  database?: SQLite.SQLiteDatabase
): Promise<SavingsGoal> {
  const db = database || getDatabase();
  const id = generateGoalId();
  const nowIso = new Date().toISOString();

  const name = input.name.trim();
  if (!name) {
    throw new Error('Goal name is required.');
  }

  const targetCentavos = Math.max(1, Math.round(input.target_centavos));
  const deadline = input.deadline?.trim() || null;
  const icon = input.icon.trim() || 'piggy-bank';
  const color = input.color.trim() || '#10B981';
  const note = input.note?.trim() || null;
  const status: SavingsGoalStatus = 'active';

  await db.runAsync(
    `INSERT INTO savings_goals
     (id, name, target_centavos, deadline, icon, color, note, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, name, targetCentavos, deadline, icon, color, note, status, nowIso, nowIso]
  );

  return {
    id,
    name,
    target_centavos: targetCentavos,
    deadline,
    icon,
    color,
    note,
    status,
    created_at: nowIso,
    updated_at: nowIso,
    allocated_centavos: 0,
  };
}

/**
 * Updates an existing savings goal.
 */
export async function updateSavingsGoal(
  id: string,
  input: UpdateSavingsGoalInput,
  database?: SQLite.SQLiteDatabase
): Promise<SavingsGoal> {
  const db = database || getDatabase();
  const existing = await getSavingsGoalById(id, db);
  if (!existing) {
    throw new Error(`Savings goal with ID "${id}" was not found.`);
  }

  const nowIso = new Date().toISOString();
  const name = input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) {
    throw new Error('Goal name cannot be empty.');
  }

  const targetCentavos =
    input.target_centavos !== undefined
      ? Math.max(1, Math.round(input.target_centavos))
      : existing.target_centavos;

  const deadline =
    input.deadline !== undefined ? input.deadline?.trim() || null : existing.deadline;
  const icon = input.icon !== undefined ? input.icon.trim() : existing.icon;
  const color = input.color !== undefined ? input.color.trim() : existing.color;
  const note = input.note !== undefined ? input.note?.trim() || null : existing.note;
  const status = input.status !== undefined ? input.status : existing.status;

  await db.runAsync(
    `UPDATE savings_goals
     SET name = ?, target_centavos = ?, deadline = ?, icon = ?, color = ?, note = ?, status = ?, updated_at = ?
     WHERE id = ?;`,
    [name, targetCentavos, deadline, icon, color, note, status, nowIso, id]
  );

  const updated = await getSavingsGoalById(id, db);
  if (!updated) {
    throw new Error(`Failed to load updated savings goal with ID "${id}".`);
  }
  return updated;
}

/**
 * Deletes a savings goal and all its savings entries transactionally.
 */
export async function deleteSavingsGoal(
  id: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Delete all associated savings entries
    await db.runAsync('DELETE FROM savings_entries WHERE goal_id = ?;', [id]);
    // 2. Delete the savings goal
    await db.runAsync('DELETE FROM savings_goals WHERE id = ?;', [id]);
  });

  return true;
}

/**
 * Retrieves all savings entries for a specific goal, sorted newest first.
 */
export async function getSavingsEntriesByGoalId(
  goalId: string,
  database?: SQLite.SQLiteDatabase
): Promise<SavingsEntry[]> {
  const db = database || getDatabase();

  const query = `
    SELECT id, goal_id, type, amount_centavos, note, entry_date, created_at
    FROM savings_entries
    WHERE goal_id = ?
    ORDER BY entry_date DESC, created_at DESC;
  `;

  return await db.getAllAsync<SavingsEntry>(query, [goalId]);
}

/**
 * Records a contribution or withdrawal entry for a savings goal.
 * Validates that withdrawals do not exceed currently allocated amount,
 * and automatically updates goal status between 'active' and 'completed'.
 */
export async function insertSavingsEntry(
  input: CreateSavingsEntryInput,
  database?: SQLite.SQLiteDatabase
): Promise<SavingsEntry> {
  const db = database || getDatabase();
  const id = generateEntryId();
  const nowIso = new Date().toISOString();

  const amountCentavos = Math.max(1, Math.round(input.amount_centavos));
  const entryDate = input.entry_date.trim();
  const note = input.note?.trim() || null;
  const type = input.type;

  let createdEntry: SavingsEntry | null = null;

  await db.withTransactionAsync(async () => {
    // 1. Verify goal exists and get current allocated balance
    const goal = await getSavingsGoalById(input.goal_id, db);
    if (!goal) {
      throw new Error(`Savings goal "${input.goal_id}" does not exist.`);
    }

    // 2. Validate withdrawal constraints
    if (type === 'withdrawal') {
      if (amountCentavos > goal.allocated_centavos) {
        const availableFormatted = formatCentavosToPhp(goal.allocated_centavos);
        throw new Error(
          `Withdrawal amount exceeds available allocation (${availableFormatted}).`
        );
      }
    }

    // 3. Insert savings entry
    await db.runAsync(
      `INSERT INTO savings_entries
       (id, goal_id, type, amount_centavos, note, entry_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, input.goal_id, type, amountCentavos, note, entryDate, nowIso]
    );

    createdEntry = {
      id,
      goal_id: input.goal_id,
      type,
      amount_centavos: amountCentavos,
      note,
      entry_date: entryDate,
      created_at: nowIso,
    };

    // 4. Calculate new allocation and update goal status if needed
    const newAllocated =
      type === 'contribution'
        ? goal.allocated_centavos + amountCentavos
        : goal.allocated_centavos - amountCentavos;

    if (goal.status !== 'archived') {
      if (newAllocated >= goal.target_centavos && goal.status === 'active') {
        // Goal reached target! Mark completed
        await db.runAsync(
          `UPDATE savings_goals SET status = 'completed', updated_at = ? WHERE id = ?;`,
          [nowIso, input.goal_id]
        );
      } else if (newAllocated < goal.target_centavos && goal.status === 'completed') {
        // Withdrawal brought it below target, return to active
        await db.runAsync(
          `UPDATE savings_goals SET status = 'active', updated_at = ? WHERE id = ?;`,
          [nowIso, input.goal_id]
        );
      }
    }
  });

  if (!createdEntry) {
    throw new Error('Failed to record savings entry.');
  }

  return createdEntry;
}

/**
 * Deletes a single savings entry and re-evaluates goal status.
 */
export async function deleteSavingsEntry(
  entryId: string,
  database?: SQLite.SQLiteDatabase
): Promise<boolean> {
  const db = database || getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Find the entry first
    const entry = await db.getFirstAsync<SavingsEntry>(
      'SELECT * FROM savings_entries WHERE id = ?;',
      [entryId]
    );
    if (!entry) return;

    // 2. Delete entry
    await db.runAsync('DELETE FROM savings_entries WHERE id = ?;', [entryId]);

    // 3. Re-evaluate goal status
    const goal = await getSavingsGoalById(entry.goal_id, db);
    if (goal && goal.status !== 'archived') {
      const nowIso = new Date().toISOString();
      if (goal.allocated_centavos >= goal.target_centavos && goal.status === 'active') {
        await db.runAsync(
          `UPDATE savings_goals SET status = 'completed', updated_at = ? WHERE id = ?;`,
          [nowIso, goal.id]
        );
      } else if (goal.allocated_centavos < goal.target_centavos && goal.status === 'completed') {
        await db.runAsync(
          `UPDATE savings_goals SET status = 'active', updated_at = ? WHERE id = ?;`,
          [nowIso, goal.id]
        );
      }
    }
  });

  return true;
}
