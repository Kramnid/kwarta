/**
 * Kwarta TypeScript Type Definitions
 */

export * from './finance';
export * from './budget';

export interface Category {
  id: string | number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: number;
  created_at: string;
}

export interface SavingsGoal {
  id: string | number;
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
