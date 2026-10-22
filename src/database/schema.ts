/**
 * Kwarta Database Schema Definitions & Default Seeds
 * All monetary amounts are stored as integer centavos to prevent floating point inaccuracies.
 */

export const DATABASE_NAME = 'kwarta.db';
export const CURRENT_SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL, -- in integer centavos
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  date TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  is_recurring INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount_limit INTEGER NOT NULL, -- in integer centavos
  period TEXT NOT NULL CHECK(period IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL, -- in integer centavos
  current_amount INTEGER NOT NULL DEFAULT 0, -- in integer centavos
  target_date TEXT,
  color TEXT DEFAULT '#10B981',
  icon TEXT DEFAULT 'target',
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
`;

export interface DefaultCategorySeed {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: number;
}

export const DEFAULT_CATEGORIES: DefaultCategorySeed[] = [
  // Expense Categories
  { name: 'Food & Dining', icon: 'utensils', color: '#F87171', type: 'expense', is_default: 1 },
  { name: 'Transportation', icon: 'car', color: '#FB923C', type: 'expense', is_default: 1 },
  { name: 'Shopping', icon: 'shopping-bag', color: '#F472B6', type: 'expense', is_default: 1 },
  { name: 'Bills & Utilities', icon: 'zap', color: '#FBBF24', type: 'expense', is_default: 1 },
  { name: 'Housing & Rent', icon: 'home', color: '#A78BFA', type: 'expense', is_default: 1 },
  { name: 'Entertainment', icon: 'film', color: '#818CF8', type: 'expense', is_default: 1 },
  { name: 'Health & Medical', icon: 'heart-pulse', color: '#38BDF8', type: 'expense', is_default: 1 },
  { name: 'Education', icon: 'graduation-cap', color: '#34D399', type: 'expense', is_default: 1 },
  { name: 'Personal Care', icon: 'sparkles', color: '#E879F9', type: 'expense', is_default: 1 },
  { name: 'General Expense', icon: 'more-horizontal', color: '#94A3B8', type: 'expense', is_default: 1 },

  // Income Categories
  { name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income', is_default: 1 },
  { name: 'Freelance & Side Hustle', icon: 'laptop', color: '#34D399', type: 'income', is_default: 1 },
  { name: 'Business Income', icon: 'trending-up', color: '#059669', type: 'income', is_default: 1 },
  { name: 'Investments & Dividends', icon: 'pie-chart', color: '#06B6D4', type: 'income', is_default: 1 },
  { name: 'Gifts & Remittances', icon: 'gift', color: '#60A5FA', type: 'income', is_default: 1 },
  { name: 'Other Income', icon: 'plus-circle', color: '#64748B', type: 'income', is_default: 1 },
];
