/**
 * Kwarta TypeScript Type Definitions
 */

export * from './finance';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: number;
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount_limit: number; // Stored in integer centavos
  period: 'weekly' | 'monthly' | 'yearly';
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
