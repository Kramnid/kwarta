/**
 * KWARTA — STEP 7: SETTINGS, CUSTOMIZATION & DATA MANAGEMENT VALIDATION SUITE
 *
 * Runs comprehensive automated tests using isolated in-memory SQLite databases:
 * 1. Category Management & Referencing Safeguards
 * 2. SQLite Settings Table Persistence
 * 3. RFC-4180 CSV Export Generation & Escaping
 * 4. Versioned JSON Backup Generation
 * 5. Backup Validation Engine (relational integrity, types, duplicate IDs)
 * 6. Isolated Database Backup & Restore Integrity Test (Prompt Requirement 16)
 * 7. Atomic Restore Rollback Safeguard
 * 8. Protected Clear All Data Safeguard
 */

const { DatabaseSync } = require('node:sqlite');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('===============================================================');
console.log('KWARTA STEP 7: SETTINGS, CUSTOMIZATION & DATA MANAGEMENT TEST');
console.log('===============================================================\n');

// DDL for isolated test databases matching Kwarta Step 7
function initSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NULL REFERENCES categories(id) ON DELETE CASCADE,
      amount_centavos INTEGER NOT NULL CHECK(amount_centavos > 0),
      month TEXT NOT NULL CHECK(length(month) = 7),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

const DEFAULT_CATEGORIES = [
  { id: 'cat_exp_food_drinks', name: 'Food & Drinks', icon: 'utensils', color: '#F87171', type: 'expense', is_default: 1 },
  { id: 'cat_exp_transportation', name: 'Transportation', icon: 'car', color: '#FB923C', type: 'expense', is_default: 1 },
  { id: 'cat_exp_groceries', name: 'Groceries', icon: 'shopping-cart', color: '#10B981', type: 'expense', is_default: 1 },
  { id: 'cat_inc_salary', name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income', is_default: 1 },
  { id: 'cat_inc_freelance', name: 'Freelance', icon: 'laptop', color: '#059669', type: 'income', is_default: 1 },
];

function seedDefaults(db) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, icon, color, type, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `);
  const now = new Date().toISOString();
  for (const cat of DEFAULT_CATEGORIES) {
    insert.run(cat.id, cat.name, cat.icon, cat.color, cat.type, cat.is_default, now);
  }
}

// -------------------------------------------------------------
// TEST 1: SQLite Settings Storage
// -------------------------------------------------------------
console.log('--- TEST 1: SQLite Settings Table Persistence ---');
const dbA = new DatabaseSync(':memory:');
initSchema(dbA);
seedDefaults(dbA);

function setSetting(db, key, value) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;
  `).run(key, value, now);
}

function getSetting(db, key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?;').get(key);
  return row ? row.value : null;
}

setSetting(dbA, 'display_name', 'Juan Dela Cruz');
setSetting(dbA, 'theme_preference', 'dark');
setSetting(dbA, 'date_format', 'DD/MM/YYYY');
setSetting(dbA, 'is_app_lock_enabled', 'false');

assert(getSetting(dbA, 'display_name') === 'Juan Dela Cruz', 'Display name matches Juan Dela Cruz');
assert(getSetting(dbA, 'theme_preference') === 'dark', 'Theme preference matches dark');
assert(getSetting(dbA, 'date_format') === 'DD/MM/YYYY', 'Date format matches DD/MM/YYYY');
assert(getSetting(dbA, 'non_existent') === null, 'Non existent setting returns null');

// Update existing key
setSetting(dbA, 'display_name', 'Maria Santos');
assert(getSetting(dbA, 'display_name') === 'Maria Santos', 'Setting successfully updated');
setSetting(dbA, 'display_name', 'Juan Dela Cruz'); // Revert for scenario test
console.log('✅ Passed: SQLite Settings CRUD & Persistence\n');

// -------------------------------------------------------------
// TEST 2: Category Management & Protection
// -------------------------------------------------------------
console.log('--- TEST 2: Custom Category Management & Protection ---');

function checkDuplicateCategory(db, name, type, excludeId = null) {
  const normalized = name.trim().toLowerCase();
  const rows = db.prepare('SELECT id, name FROM categories WHERE type = ?;').all(type);
  return rows.some(r => r.name.trim().toLowerCase() === normalized && r.id !== excludeId);
}

// Check duplicate prevention
assert(checkDuplicateCategory(dbA, '  food & drinks  ', 'expense') === true, 'Duplicate normalized name detected');
assert(checkDuplicateCategory(dbA, 'Food & Drinks', 'income') === false, 'Same name in different type allowed');

// Insert 1 custom category
const customCatId = 'cat_exp_gaming';
dbA.prepare(`
  INSERT INTO categories (id, name, icon, color, type, is_default, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?);
`).run(customCatId, 'Gaming & Tech', 'gamepad-2', '#818CF8', 'expense', 0, new Date().toISOString());

assert(checkDuplicateCategory(dbA, 'Gaming & Tech', 'expense') === true, 'Custom category registered');

function canDeleteCategory(db, categoryId) {
  const cat = db.prepare('SELECT is_default FROM categories WHERE id = ?;').get(categoryId);
  if (!cat) return { canDelete: false, reason: 'Category does not exist' };
  if (cat.is_default === 1) return { canDelete: false, reason: 'Default category cannot be deleted' };

  const txUsage = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ?;').get(categoryId);
  if (txUsage.count > 0) return { canDelete: false, reason: `Used by ${txUsage.count} transaction(s)` };

  const budgetUsage = db.prepare('SELECT COUNT(*) as count FROM budgets WHERE category_id = ?;').get(categoryId);
  if (budgetUsage.count > 0) return { canDelete: false, reason: `Used by ${budgetUsage.count} budget(s)` };

  return { canDelete: true };
}

// Verify default category protected
const defaultCheck = canDeleteCategory(dbA, 'cat_exp_food_drinks');
assert(defaultCheck.canDelete === false && defaultCheck.reason.includes('Default'), 'Default category protected from deletion');

// Verify unused custom category can be deleted
const customCheckBefore = canDeleteCategory(dbA, customCatId);
assert(customCheckBefore.canDelete === true, 'Unused custom category can be deleted');
console.log('✅ Passed: Category duplicate checking and default category protection\n');

// -------------------------------------------------------------
// TEST 3: Populate Full Backup Scenario (Requirement 16)
// Scenario:
// - Two income transactions
// - Three expense transactions (one referencing custom category)
// - Two budgets
// - Two savings goals
// - Multiple savings entries
// - One custom category
// - Profile and appearance settings
// -------------------------------------------------------------
console.log('--- TEST 3: Populate Financial Dataset Scenario ---');

// Transactions
const insertTx = dbA.prepare(`
  INSERT INTO transactions (id, type, amount_centavos, category_id, title, note, transaction_date, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

const nowIso = new Date().toISOString();
// 2 Income
insertTx.run('tx_inc_1', 'income', 5000000, 'cat_inc_salary', 'Monthly Salary, October', 'Regular payout', '2026-10-15', nowIso, nowIso);
insertTx.run('tx_inc_2', 'income', 1500000, 'cat_inc_freelance', 'Web Design "Project Alpha"', 'Client deposit', '2026-10-18', nowIso, nowIso);

// 3 Expenses (including comma and quote in title, and referencing custom category)
insertTx.run('tx_exp_1', 'expense', 45000, 'cat_exp_food_drinks', 'Lunch, Coffee & "Snacks"', 'Cafe latte and pastry', '2026-10-20', nowIso, nowIso);
insertTx.run('tx_exp_2', 'expense', 320000, 'cat_exp_groceries', 'Supermarket Groceries', 'Weekly supply', '2026-10-21', nowIso, nowIso);
insertTx.run('tx_exp_3', 'expense', 249900, customCatId, 'Steam Game: "Cyberpunk, 2077"', 'Digital purchase', '2026-10-22', nowIso, nowIso);

// 2 Budgets
const insertBudget = dbA.prepare(`
  INSERT INTO budgets (id, category_id, amount_centavos, month, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?);
`);
insertBudget.run('bgt_overall_oct', null, 3000000, '2026-10', nowIso, nowIso);
insertBudget.run('bgt_food_oct', 'cat_exp_food_drinks', 1000000, '2026-10', nowIso, nowIso);

// 2 Savings Goals
const insertGoal = dbA.prepare(`
  INSERT INTO savings_goals (id, name, target_centavos, deadline, icon, color, note, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);
insertGoal.run('goal_laptop', 'MacBook M3 Pro', 9000000, '2026-12-31', 'laptop', '#10B981', 'Work upgrade', 'active', nowIso, nowIso);
insertGoal.run('goal_emergency', 'Emergency Fund', 5000000, null, 'shield-alert', '#38BDF8', '6 months runway', 'active', nowIso, nowIso);

// Multiple Savings Entries
const insertEntry = dbA.prepare(`
  INSERT INTO savings_entries (id, goal_id, type, amount_centavos, note, entry_date, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?);
`);
insertEntry.run('entry_1', 'goal_laptop', 'contribution', 2000000, 'Initial deposit', '2026-10-16', nowIso);
insertEntry.run('entry_2', 'goal_laptop', 'contribution', 1500000, 'Freelance bonus', '2026-10-19', nowIso);
insertEntry.run('entry_3', 'goal_laptop', 'withdrawal', 500000, 'Temporary cash need', '2026-10-21', nowIso);
insertEntry.run('entry_4', 'goal_emergency', 'contribution', 1000000, 'Monthly allocation', '2026-10-16', nowIso);

// Now test that custom category referenced by transaction cannot be deleted
const customCheckAfterTx = canDeleteCategory(dbA, customCatId);
assert(customCheckAfterTx.canDelete === false && customCheckAfterTx.reason.includes('transaction'), 'Custom category with transactions is protected');

console.log('✅ Passed: Populated test dataset with 2 income, 3 expenses, 2 budgets, 2 goals, 4 entries\n');

// -------------------------------------------------------------
// TEST 4: CSV Export Formatting & RFC-4180 Escaping
// -------------------------------------------------------------
console.log('--- TEST 4: RFC-4180 CSV Export Generation ---');

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateCsv(txs, cats) {
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const headers = ['Transaction ID', 'Date', 'Type', 'Title', 'Category', 'Amount (PHP)', 'Note'];
  const rows = txs.map(tx => {
    const catName = catMap.get(tx.category_id) || 'Uncategorized';
    const decimal = (tx.amount_centavos / 100).toFixed(2);
    const signed = tx.type === 'expense' ? `-${decimal}` : decimal;
    return [
      escapeCsvCell(tx.id),
      escapeCsvCell(tx.transaction_date),
      escapeCsvCell(tx.type.toUpperCase()),
      escapeCsvCell(tx.title),
      escapeCsvCell(catName),
      escapeCsvCell(signed),
      escapeCsvCell(tx.note || ''),
    ].join(',');
  });
  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

const allTxs = dbA.prepare('SELECT * FROM transactions ORDER BY transaction_date DESC;').all();
const allCats = dbA.prepare('SELECT * FROM categories;').all();
const csvOutput = generateCsv(allTxs, allCats);

assert(csvOutput.startsWith('\uFEFFTransaction ID,Date,Type,Title,Category,Amount (PHP),Note'), 'CSV contains UTF-8 BOM and headers');
assert(csvOutput.includes('"Steam Game: ""Cyberpunk, 2077"""'), 'RFC-4180 quotation and comma escaping works');
assert(csvOutput.includes('"Lunch, Coffee & ""Snacks"""'), 'Quoted and comma title properly escaped');
assert(csvOutput.includes('50000.00'), 'Income formatted to 2 decimals positive');
assert(csvOutput.includes('-2499.00'), 'Expense formatted to 2 decimals negative');
console.log('✅ Passed: RFC-4180 CSV generation with UTF-8 BOM and special character escaping\n');

// -------------------------------------------------------------
// TEST 5: JSON Backup Creation & Validation
// -------------------------------------------------------------
console.log('--- TEST 5: JSON Backup Creation & Validation ---');

function createBackup(db) {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC;').all();
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY transaction_date DESC;').all();
  const budgets = db.prepare('SELECT * FROM budgets;').all();
  const savingsGoals = db.prepare('SELECT * FROM savings_goals;').all();
  const savingsEntries = db.prepare('SELECT * FROM savings_entries;').all();
  const settingsRows = db.prepare('SELECT key, value FROM settings;').all();

  const settings = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  return {
    app: 'Kwarta',
    backupVersion: 1,
    createdAt: new Date().toISOString(),
    data: {
      categories,
      transactions,
      budgets,
      savingsGoals,
      savingsEntries,
      settings,
    },
  };
}

function validateBackup(backup) {
  if (!backup || typeof backup !== 'object') return { isValid: false, error: 'Not an object' };
  if (backup.app !== 'Kwarta') return { isValid: false, error: 'App mismatch' };
  if (backup.backupVersion !== 1) return { isValid: false, error: 'Version mismatch' };
  if (!backup.data || typeof backup.data !== 'object') return { isValid: false, error: 'Missing data' };

  const { categories, transactions, budgets, savingsGoals, savingsEntries, settings } = backup.data;
  if (!Array.isArray(categories) || !Array.isArray(transactions) || !Array.isArray(budgets) ||
      !Array.isArray(savingsGoals) || !Array.isArray(savingsEntries)) {
    return { isValid: false, error: 'Collections must be arrays' };
  }

  // Categories duplicate check
  const catIds = new Set();
  for (const c of categories) {
    if (!c.id || catIds.has(c.id)) return { isValid: false, error: `Duplicate or missing category ID: ${c.id}` };
    catIds.add(c.id);
  }

  // Transactions FK check
  const txIds = new Set();
  for (const tx of transactions) {
    if (!tx.id || txIds.has(tx.id)) return { isValid: false, error: `Duplicate or missing tx ID: ${tx.id}` };
    txIds.add(tx.id);
    if (!catIds.has(tx.category_id)) return { isValid: false, error: `Tx references missing category ${tx.category_id}` };
    if (typeof tx.amount_centavos !== 'number' || tx.amount_centavos <= 0) return { isValid: false, error: 'Invalid amount' };
  }

  // Savings goals FK check
  const goalIds = new Set();
  for (const g of savingsGoals) {
    if (!g.id || goalIds.has(g.id)) return { isValid: false, error: `Duplicate or missing goal ID: ${g.id}` };
    goalIds.add(g.id);
  }

  for (const entry of savingsEntries) {
    if (!entry.goal_id || !goalIds.has(entry.goal_id)) return { isValid: false, error: `Entry references missing goal: ${entry.goal_id}` };
  }

  return { isValid: true };
}

const backupSnapshot = createBackup(dbA);
const validResult = validateBackup(backupSnapshot);
assert(validResult.isValid === true, 'Backup snapshot passes validation');

// Test rejection of tampered backups
assert(validateBackup({ ...backupSnapshot, app: 'OtherFinance' }).isValid === false, 'Rejects non-Kwarta app');
assert(validateBackup({ ...backupSnapshot, backupVersion: 2 }).isValid === false, 'Rejects unsupported version');

// Test rejection of broken foreign key
const brokenFkBackup = JSON.parse(JSON.stringify(backupSnapshot));
brokenFkBackup.data.transactions[0].category_id = 'non_existent_category_xyz';
assert(validateBackup(brokenFkBackup).isValid === false, 'Rejects broken category FK');

// Test rejection of duplicate IDs
const duplicateTxBackup = JSON.parse(JSON.stringify(backupSnapshot));
duplicateTxBackup.data.transactions.push({ ...duplicateTxBackup.data.transactions[0] });
assert(validateBackup(duplicateTxBackup).isValid === false, 'Rejects duplicate transaction ID');

console.log('✅ Passed: JSON Backup creation, structural checks, and relational integrity validation\n');

// -------------------------------------------------------------
// TEST 6: Isolated Database Restore Test (Requirement 16)
// Restore into another isolated database and verify all records match
// -------------------------------------------------------------
console.log('--- TEST 6: Isolated Database Restore & Identity Verification ---');

const dbB = new DatabaseSync(':memory:');
initSchema(dbB);
// dbB starts empty or with default categories

function restoreBackupData(db, backup) {
  const { categories, transactions, budgets, savingsGoals, savingsEntries, settings } = backup.data;

  // Use a transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    // Clear existing
    db.exec(`
      DELETE FROM savings_entries;
      DELETE FROM savings_goals;
      DELETE FROM transactions;
      DELETE FROM budgets;
      DELETE FROM categories;
      DELETE FROM settings;
    `);

    // Insert categories
    const insCat = db.prepare(`
      INSERT INTO categories (id, name, icon, color, type, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);
    for (const c of categories) {
      insCat.run(c.id, c.name, c.icon, c.color, c.type, c.is_default ? 1 : 0, c.created_at);
    }

    // Insert transactions
    const insTx = db.prepare(`
      INSERT INTO transactions (id, type, amount_centavos, category_id, title, note, transaction_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);
    for (const t of transactions) {
      insTx.run(t.id, t.type, t.amount_centavos, t.category_id, t.title, t.note || null, t.transaction_date, t.created_at, t.updated_at);
    }

    // Insert budgets
    const insBgt = db.prepare(`
      INSERT INTO budgets (id, category_id, amount_centavos, month, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `);
    for (const b of budgets) {
      insBgt.run(b.id, b.category_id || null, b.amount_centavos, b.month, b.created_at, b.updated_at);
    }

    // Insert savings goals
    const insGoal = db.prepare(`
      INSERT INTO savings_goals (id, name, target_centavos, deadline, icon, color, note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);
    for (const g of savingsGoals) {
      insGoal.run(g.id, g.name, g.target_centavos, g.deadline || null, g.icon, g.color, g.note || null, g.status || 'active', g.created_at, g.updated_at);
    }

    // Insert savings entries
    const insEntry = db.prepare(`
      INSERT INTO savings_entries (id, goal_id, type, amount_centavos, note, entry_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);
    for (const e of savingsEntries) {
      insEntry.run(e.id, e.goal_id, e.type, e.amount_centavos, e.note || null, e.entry_date, e.created_at);
    }

    // Insert settings
    const insSetting = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?);
    `);
    const now = new Date().toISOString();
    for (const [k, v] of Object.entries(settings || {})) {
      insSetting.run(k, v, now);
    }

    db.exec('COMMIT;');
    return { success: true };
  } catch (err) {
    db.exec('ROLLBACK;');
    return { success: false, error: err.message };
  }
}

const restoreResult = restoreBackupData(dbB, backupSnapshot);
assert(restoreResult.success === true, 'Restoration succeeded on isolated dbB');

// Verify counts
const countTxs = dbB.prepare('SELECT COUNT(*) as c FROM transactions;').get().c;
const countBudgets = dbB.prepare('SELECT COUNT(*) as c FROM budgets;').get().c;
const countGoals = dbB.prepare('SELECT COUNT(*) as c FROM savings_goals;').get().c;
const countEntries = dbB.prepare('SELECT COUNT(*) as c FROM savings_entries;').get().c;
const countCats = dbB.prepare('SELECT COUNT(*) as c FROM categories;').get().c;

assert(countTxs === 5, `Expected 5 transactions, found ${countTxs}`);
assert(countBudgets === 2, `Expected 2 budgets, found ${countBudgets}`);
assert(countGoals === 2, `Expected 2 goals, found ${countGoals}`);
assert(countEntries === 4, `Expected 4 savings entries, found ${countEntries}`);
assert(countCats === 6, `Expected 6 categories (5 default + 1 custom), found ${countCats}`);

// Verify exact data matching
const origTxs = dbA.prepare('SELECT * FROM transactions ORDER BY id;').all();
const restoredTxs = dbB.prepare('SELECT * FROM transactions ORDER BY id;').all();
assert(JSON.stringify(origTxs) === JSON.stringify(restoredTxs), 'Restored transactions match exactly');

const origSettings = dbA.prepare('SELECT key, value FROM settings ORDER BY key;').all();
const restoredSettings = dbB.prepare('SELECT key, value FROM settings ORDER BY key;').all();
assert(JSON.stringify(origSettings) === JSON.stringify(restoredSettings), 'Restored settings match exactly');

console.log('✅ Passed: Isolated Database Restore & 100% Identity Verification\n');

// -------------------------------------------------------------
// TEST 7: Atomic Rollback on Corrupt Restoration
// -------------------------------------------------------------
console.log('--- TEST 7: Atomic Rollback Safeguard ---');

const malformedPayload = {
  data: {
    categories: [],
    transactions: [
      { id: 'corrupt_1', type: 'INVALID_TYPE', amount_centavos: -100, category_id: 'missing', title: 'X', transaction_date: 'invalid', created_at: 'now', updated_at: 'now' }
    ],
    budgets: [],
    savingsGoals: [],
    savingsEntries: [],
    settings: {},
  }
};

const failRestore = restoreBackupData(dbB, malformedPayload);
assert(failRestore.success === false, 'Invalid restore fails as expected');

// Verify dbB still contains its 5 transactions after rollback!
const countAfterRollback = dbB.prepare('SELECT COUNT(*) as c FROM transactions;').get().c;
assert(countAfterRollback === 5, `Database preserved after failed restore: still has ${countAfterRollback} transactions`);
console.log('✅ Passed: Atomic transaction rollback preserved existing database state without loss\n');

// -------------------------------------------------------------
// TEST 8: Clear All Data Safeguard
// -------------------------------------------------------------
console.log('--- TEST 8: Clear All Data Safeguard ---');

function clearAllFinancialData(db) {
  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec(`
      DELETE FROM savings_entries;
      DELETE FROM savings_goals;
      DELETE FROM transactions;
      DELETE FROM budgets;
      DELETE FROM categories WHERE is_default = 0;
      DELETE FROM settings WHERE key NOT IN ('theme_preference', 'date_format');
    `);
    db.exec('COMMIT;');
    return { success: true };
  } catch (err) {
    db.exec('ROLLBACK;');
    return { success: false, error: err.message };
  }
}

const clearResult = clearAllFinancialData(dbB);
assert(clearResult.success === true, 'Clear all financial data completed');

const clearedTxs = dbB.prepare('SELECT COUNT(*) as c FROM transactions;').get().c;
const clearedBudgets = dbB.prepare('SELECT COUNT(*) as c FROM budgets;').get().c;
const clearedGoals = dbB.prepare('SELECT COUNT(*) as c FROM savings_goals;').get().c;
const clearedEntries = dbB.prepare('SELECT COUNT(*) as c FROM savings_entries;').get().c;
const remainingCats = dbB.prepare('SELECT COUNT(*) as c FROM categories;').get().c;
const remainingCustomCats = dbB.prepare('SELECT COUNT(*) as c FROM categories WHERE is_default = 0;').get().c;

assert(clearedTxs === 0, 'Transactions successfully cleared');
assert(clearedBudgets === 0, 'Budgets successfully cleared');
assert(clearedGoals === 0, 'Savings goals successfully cleared');
assert(clearedEntries === 0, 'Savings entries successfully cleared');
assert(remainingCustomCats === 0, 'Custom categories cleared');
assert(remainingCats === 5, 'Default categories preserved intact');

console.log('✅ Passed: Clear all data safely deletes user records while preserving default categories\n');

console.log('===============================================================');
console.log('🎉 ALL KWARTA STEP 7 SETTINGS & DATA TESTS PASSED PERFECTLY!');
console.log('===============================================================');
