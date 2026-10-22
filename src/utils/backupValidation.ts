/**
 * Validation utilities for Kwarta JSON backups
 */

import {
  KwartaBackupFile,
  BackupValidationResult,
} from '@/types/settings';

/**
 * Validates the raw JSON string or object of a Kwarta backup file.
 * Performs rigorous structural, type, and relational integrity checks.
 */
export function validateBackupData(rawContent: string | object): BackupValidationResult {
  let backup: any;

  try {
    if (typeof rawContent === 'string') {
      backup = JSON.parse(rawContent);
    } else {
      backup = rawContent;
    }
  } catch {
    return {
      isValid: false,
      error: 'Invalid JSON file: Unable to parse file contents.',
    };
  }

  if (!backup || typeof backup !== 'object') {
    return {
      isValid: false,
      error: 'Malformed backup: Root must be a JSON object.',
    };
  }

  // 1. App Identifier
  if (backup.app !== 'Kwarta') {
    return {
      isValid: false,
      error: `Incompatible backup source: Expected app "Kwarta", but found "${backup.app || 'unknown'}".`,
    };
  }

  // 2. Backup Version
  if (backup.backupVersion !== 1) {
    return {
      isValid: false,
      error: `Unsupported backup version: Expected version 1, but found version ${backup.backupVersion}.`,
    };
  }

  // 3. Data Collections
  const data = backup.data;
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Malformed backup: Missing "data" section in backup file.',
    };
  }

  const { categories, transactions, budgets, savingsGoals, savingsEntries, settings } = data;

  if (!Array.isArray(categories)) {
    return { isValid: false, error: 'Malformed backup: "categories" must be an array.' };
  }
  if (!Array.isArray(transactions)) {
    return { isValid: false, error: 'Malformed backup: "transactions" must be an array.' };
  }
  if (!Array.isArray(budgets)) {
    return { isValid: false, error: 'Malformed backup: "budgets" must be an array.' };
  }
  if (!Array.isArray(savingsGoals)) {
    return { isValid: false, error: 'Malformed backup: "savingsGoals" must be an array.' };
  }
  if (!Array.isArray(savingsEntries)) {
    return { isValid: false, error: 'Malformed backup: "savingsEntries" must be an array.' };
  }
  if (settings && typeof settings !== 'object') {
    return { isValid: false, error: 'Malformed backup: "settings" must be an object if present.' };
  }

  // 4. Validate Categories & check for duplicate IDs
  const categoryIds = new Set<string>();
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (!cat.id || typeof cat.id !== 'string') {
      return { isValid: false, error: `Invalid category at index ${i}: missing or invalid id.` };
    }
    if (categoryIds.has(cat.id)) {
      return { isValid: false, error: `Duplicate category ID detected: "${cat.id}".` };
    }
    categoryIds.add(cat.id);

    if (!cat.name || typeof cat.name !== 'string') {
      return { isValid: false, error: `Category "${cat.id}" has an invalid name.` };
    }
    if (cat.type !== 'income' && cat.type !== 'expense') {
      return { isValid: false, error: `Category "${cat.name}" has invalid type "${cat.type}". Must be income or expense.` };
    }
  }

  // 5. Validate Transactions & relational integrity to categories
  const transactionIds = new Set<string>();
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (!tx.id || typeof tx.id !== 'string') {
      return { isValid: false, error: `Invalid transaction at index ${i}: missing or invalid id.` };
    }
    if (transactionIds.has(tx.id)) {
      return { isValid: false, error: `Duplicate transaction ID detected: "${tx.id}".` };
    }
    transactionIds.add(tx.id);

    if (tx.type !== 'income' && tx.type !== 'expense') {
      return { isValid: false, error: `Transaction "${tx.id}" has invalid type "${tx.type}".` };
    }

    if (typeof tx.amount_centavos !== 'number' || tx.amount_centavos <= 0 || !Number.isInteger(tx.amount_centavos)) {
      return { isValid: false, error: `Transaction "${tx.id}" has invalid amount_centavos: must be a positive integer.` };
    }

    if (!tx.category_id || !categoryIds.has(tx.category_id)) {
      return { isValid: false, error: `Transaction "${tx.id}" references non-existent category "${tx.category_id}".` };
    }

    if (!tx.title || typeof tx.title !== 'string') {
      return { isValid: false, error: `Transaction "${tx.id}" is missing a valid title.` };
    }

    if (!tx.transaction_date || typeof tx.transaction_date !== 'string') {
      return { isValid: false, error: `Transaction "${tx.id}" is missing a valid transaction_date.` };
    }
  }

  // 6. Validate Budgets & relational integrity
  const budgetIds = new Set<string>();
  for (let i = 0; i < budgets.length; i++) {
    const b = budgets[i];
    if (!b.id || typeof b.id !== 'string') {
      return { isValid: false, error: `Invalid budget at index ${i}: missing or invalid id.` };
    }
    if (budgetIds.has(b.id)) {
      return { isValid: false, error: `Duplicate budget ID detected: "${b.id}".` };
    }
    budgetIds.add(b.id);

    if (typeof b.amount_centavos !== 'number' || b.amount_centavos <= 0) {
      return { isValid: false, error: `Budget "${b.id}" has invalid amount_centavos.` };
    }

    if (b.category_id && !categoryIds.has(b.category_id)) {
      return { isValid: false, error: `Budget "${b.id}" references non-existent category "${b.category_id}".` };
    }

    if (!b.month || typeof b.month !== 'string' || b.month.length !== 7) {
      return { isValid: false, error: `Budget "${b.id}" has invalid month format (expected YYYY-MM).` };
    }
  }

  // 7. Validate Savings Goals
  const savingsGoalIds = new Set<string>();
  for (let i = 0; i < savingsGoals.length; i++) {
    const goal = savingsGoals[i];
    if (!goal.id || typeof goal.id !== 'string') {
      return { isValid: false, error: `Invalid savings goal at index ${i}: missing id.` };
    }
    if (savingsGoalIds.has(goal.id)) {
      return { isValid: false, error: `Duplicate savings goal ID detected: "${goal.id}".` };
    }
    savingsGoalIds.add(goal.id);

    if (!goal.name || typeof goal.name !== 'string') {
      return { isValid: false, error: `Savings goal "${goal.id}" has an invalid name.` };
    }

    if (typeof goal.target_centavos !== 'number' || goal.target_centavos <= 0) {
      return { isValid: false, error: `Savings goal "${goal.name}" has invalid target_centavos.` };
    }
  }

  // 8. Validate Savings Entries & foreign keys to goals
  const entryIds = new Set<string>();
  for (let i = 0; i < savingsEntries.length; i++) {
    const entry = savingsEntries[i];
    if (!entry.id || typeof entry.id !== 'string') {
      return { isValid: false, error: `Invalid savings entry at index ${i}: missing id.` };
    }
    if (entryIds.has(entry.id)) {
      return { isValid: false, error: `Duplicate savings entry ID detected: "${entry.id}".` };
    }
    entryIds.add(entry.id);

    if (!entry.goal_id || !savingsGoalIds.has(entry.goal_id)) {
      return { isValid: false, error: `Savings entry "${entry.id}" references non-existent goal "${entry.goal_id}".` };
    }

    if (entry.type !== 'contribution' && entry.type !== 'withdrawal') {
      return { isValid: false, error: `Savings entry "${entry.id}" has invalid type "${entry.type}".` };
    }

    if (typeof entry.amount_centavos !== 'number' || entry.amount_centavos <= 0) {
      return { isValid: false, error: `Savings entry "${entry.id}" has invalid amount_centavos.` };
    }
  }

  return {
    isValid: true,
    summary: {
      transactionsCount: transactions.length,
      categoriesCount: categories.length,
      budgetsCount: budgets.length,
      savingsGoalsCount: savingsGoals.length,
      savingsEntriesCount: savingsEntries.length,
      createdAt: backup.createdAt || new Date().toISOString(),
    },
    parsedData: backup as KwartaBackupFile,
  };
}
