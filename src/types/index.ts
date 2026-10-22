/**
 * Kwarta TypeScript Type Definitions
 */

export type TransactionType = 'income' | 'expense';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_default: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  amount: number; // Stored in integer centavos (e.g., ₱125.50 = 12550)
  type: TransactionType;
  category_id: number;
  description?: string;
  date: string; // ISO 8601 string (YYYY-MM-DD or timestamp)
  payment_method?: string;
  is_recurring: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount_limit: number; // Stored in integer centavos
  period: BudgetPeriod;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface SavingsGoal {
  id: number;
  title: string;
  target_amount: number; // Stored in integer centavos
  current_amount: number; // Stored in integer centavos
  target_date?: string;
  color?: string;
  icon?: string;
  is_completed: number;
  created_at: string;
}

export interface DatabaseInitResult {
  success: boolean;
  version?: number;
  error?: string;
}
