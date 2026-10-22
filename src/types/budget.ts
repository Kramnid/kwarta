/**
 * Budget Domain Types for Kwarta
 *
 * All monetary amounts are stored as integer centavos to eliminate floating-point precision errors.
 */

import { TransactionCategory } from './finance';

export type BudgetStatus = 'healthy' | 'caution' | 'warning' | 'exceeded';

export interface Budget {
  id: string; // Stable text ID (e.g. 'bg_1729600000_abc')
  category_id: string | null; // null represents an overall monthly spending budget
  amount_centavos: number; // positive integer centavos
  month: string; // Calendar month: YYYY-MM (e.g. '2026-10')
  created_at: string;
  updated_at: string;
  category?: TransactionCategory;
}

export interface CreateBudgetInput {
  category_id: string | null; // null for overall monthly budget
  amount_centavos: number; // positive integer centavos
  month: string; // YYYY-MM
}

export interface UpdateBudgetInput {
  amount_centavos?: number;
  month?: string;
  category_id?: string | null;
}

export interface BudgetCalculation {
  budget: Budget;
  budgetLimitCentavos: number;
  spentCentavos: number;
  remainingCentavos: number; // can be negative if exceeded
  percentage: number; // real percentage: (spent / limit) * 100
  cappedPercentage: number; // 0 to 100 for visual progress bars
  isExceeded: boolean;
  status: BudgetStatus;
  warningMessage?: string;
}

export interface MonthlyBudgetOverview {
  hasOverallBudget: boolean;
  overallBudget: Budget | null;
  totalBudgetLimitCentavos: number; // If overall budget exists, uses that; otherwise sum of category budgets
  totalSpentCentavos: number; // Total monthly expense spending
  remainingCentavos: number; // can be negative if exceeded
  percentage: number;
  cappedPercentage: number;
  isExceeded: boolean;
  status: BudgetStatus;
  categoryBudgetsCount: number;
}
