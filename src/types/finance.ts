/**
 * Financial Domain Types for Kwarta
 *
 * All monetary amounts are stored as integer centavos (e.g. ₱125.50 = 12550 centavos)
 * to eliminate floating-point precision errors.
 */

export type TransactionType = 'income' | 'expense';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface TransactionCategory {
  id: string; // Stable text ID (e.g. 'cat_exp_food_drinks')
  name: string;
  icon: string; // Lucide icon identifier string
  color: string; // Hex color string
  type: TransactionType;
  is_default: number;
  created_at?: string;
}

export interface Transaction {
  id: string; // Text primary key (e.g. 'tx_1729600000_abc')
  type: TransactionType;
  amount_centavos: number; // Positive integer centavos
  category_id: string;
  title: string;
  note?: string | null;
  transaction_date: string; // ISO calendar date: YYYY-MM-DD
  created_at: string;
  updated_at: string;
  category?: TransactionCategory;

  // Compatibility aliases for Step 2 presentation code
  amount?: number; // centavos alias for amount_centavos
  description?: string; // alias for title
  date?: string; // alias for transaction_date
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount_centavos: number;
  category_id: string;
  title: string;
  note?: string | null;
  transaction_date: string; // YYYY-MM-DD
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

export type TransactionDateFilter =
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'custom';

export type TransactionSortOption =
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc';

export interface TransactionFilters {
  searchQuery?: string;
  type?: 'all' | TransactionType;
  categoryId?: string | 'all';
  dateFilter?: TransactionDateFilter;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sortBy?: TransactionSortOption;
}

export interface DashboardSummary {
  totalIncome: number; // in integer centavos
  totalExpenses: number; // in integer centavos
  totalBalance: number; // in integer centavos (totalIncome - totalExpenses)
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number; // in integer centavos
  percentage: number; // 0 to 100
}

export interface DateGroupedTransactions {
  date: string; // YYYY-MM-DD
  title: string; // "Today", "Yesterday", or formatted date
  transactions: Transaction[];
  totalIncomeCentavos: number;
  totalExpensesCentavos: number;
}
