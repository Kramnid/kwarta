/**
 * Financial Domain Types for Kwarta
 *
 * NOTE: All monetary amounts (amount, balance, income, expense, limit, target)
 * are represented as integer centavos (e.g. ₱12,500.00 = 1250000 centavos)
 * to prevent floating-point precision issues.
 */

export type TransactionType = 'income' | 'expense';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface TransactionCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_default?: number;
  created_at?: string;
}

export interface Transaction {
  id: number;
  amount: number; // Stored in integer centavos (e.g., ₱2,500.00 = 250000)
  type: TransactionType;
  category_id: number;
  category?: TransactionCategory;
  description?: string;
  date: string; // ISO 8601 string (YYYY-MM-DD or ISO timestamp)
  payment_method?: string;
  is_recurring?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardSummary {
  totalIncome: number; // in integer centavos
  totalExpenses: number; // in integer centavos
  totalBalance: number; // in integer centavos (totalIncome - totalExpenses)
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number; // in integer centavos
  percentage: number; // 0 to 100
}
