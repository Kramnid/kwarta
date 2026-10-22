/**
 * Pure Budget Calculation and Domain Helpers for Kwarta
 *
 * NOTE: All monetary inputs and outputs are in integer centavos to eliminate floating-point inaccuracies.
 */

import { Transaction } from '@/types/finance';
import {
  Budget,
  BudgetStatus,
  BudgetCalculation,
  MonthlyBudgetOverview,
} from '@/types/budget';
import { formatCentavosToPhp } from './currency';
import { getEffectiveAmount, getEffectiveDate } from './finance';
import { formatLocalDate } from './date';

/**
 * Returns the current month in YYYY-MM based on local device calendar.
 */
export function getCurrentMonthString(date: Date = new Date()): string {
  return formatLocalDate(date).substring(0, 7);
}

/**
 * Formats a YYYY-MM string into a human-readable month string (e.g. "October 2026").
 */
export function formatMonthDisplay(monthStr: string): string {
  if (!monthStr || monthStr.length < 7) {
    return monthStr;
  }
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10) - 1;

  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns previous month YYYY-MM string.
 */
export function getPreviousMonthString(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) - 1; // 0-indexed

  month -= 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }

  const paddedMonth = String(month + 1).padStart(2, '0');
  return `${year}-${paddedMonth}`;
}

/**
 * Returns next month YYYY-MM string.
 */
export function getNextMonthString(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) - 1;

  month += 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  const paddedMonth = String(month + 1).padStart(2, '0');
  return `${year}-${paddedMonth}`;
}

/**
 * Computes status level based on percentage used.
 */
export function calculateBudgetStatus(percentage: number): BudgetStatus {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'warning';
  if (percentage >= 75) return 'caution';
  return 'healthy';
}

/**
 * Returns theme color matching budget status.
 */
export function getBudgetStatusColor(status: BudgetStatus): string {
  switch (status) {
    case 'healthy':
      return '#10B981'; // Emerald Green
    case 'caution':
      return '#FBBF24'; // Amber / Yellow
    case 'warning':
      return '#FB923C'; // Orange
    case 'exceeded':
      return '#F87171'; // Red / Rose
  }
}

/**
 * Returns friendly status label.
 */
export function getBudgetStatusLabel(status: BudgetStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'caution':
      return 'Caution';
    case 'warning':
      return 'Near Limit';
    case 'exceeded':
      return 'Exceeded';
  }
}

/**
 * Generates contextual warning message for a budget when thresholds are reached.
 */
export function getBudgetWarningMessage(
  title: string,
  percentage: number,
  remainingCentavos: number
): string | undefined {
  if (percentage > 100) {
    const exceededAmount = formatCentavosToPhp(Math.abs(remainingCentavos));
    return `You've exceeded your ${title} budget by ${exceededAmount}.`;
  }
  if (percentage === 100) {
    return `You've reached your ${title} budget.`;
  }
  if (percentage >= 90) {
    return `You're close to your ${title} budget limit.`;
  }
  if (percentage >= 75) {
    return `You're using ${Math.round(percentage)}% of your ${title} budget.`;
  }
  return undefined;
}

/**
 * Sums all expense transactions belonging to a given calendar month (YYYY-MM).
 * Income transactions NEVER contribute to spending.
 */
export function calculateSpendingForMonth(
  transactions: Transaction[],
  month: string
): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const txDate = getEffectiveDate(tx);
    if (txDate.startsWith(month)) {
      return acc + getEffectiveAmount(tx);
    }
    return acc;
  }, 0);
}

/**
 * Sums expense transactions matching the given category and calendar month.
 */
export function calculateSpendingForCategoryAndMonth(
  transactions: Transaction[],
  categoryId: string,
  month: string
): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const txCatId = String(tx.category_id || tx.category?.id || '');
    if (txCatId !== categoryId) return acc;
    const txDate = getEffectiveDate(tx);
    if (txDate.startsWith(month)) {
      return acc + getEffectiveAmount(tx);
    }
    return acc;
  }, 0);
}

/**
 * Calculates complete details for an individual budget.
 */
export function calculateBudgetDetails(
  budget: Budget,
  transactions: Transaction[]
): BudgetCalculation {
  const limit = Math.max(0, budget.amount_centavos);
  const isOverall = !budget.category_id;

  const spent = isOverall
    ? calculateSpendingForMonth(transactions, budget.month)
    : calculateSpendingForCategoryAndMonth(
        transactions,
        budget.category_id!,
        budget.month
      );

  const remaining = limit - spent;
  const isExceeded = spent > limit;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 100) / 100;
  const cappedPercentage = Math.min(100, Math.max(0, percentage));
  const status = calculateBudgetStatus(percentage);

  const title = isOverall
    ? 'Monthly'
    : budget.category?.name || 'Category';

  const warningMessage = getBudgetWarningMessage(
    title,
    roundedPercentage,
    remaining
  );

  return {
    budget,
    budgetLimitCentavos: limit,
    spentCentavos: spent,
    remainingCentavos: remaining,
    percentage: roundedPercentage,
    cappedPercentage,
    isExceeded,
    status,
    warningMessage,
  };
}

/**
 * Calculates monthly budget overview according to the strict rule:
 * - If an overall monthly budget exists, use it as the overall limit.
 * - Do NOT automatically sum category budget limits to overall limit to prevent double-counting.
 * - Calculate actual monthly spending from all expense transactions in the month.
 */
export function calculateMonthlyOverview(
  budgets: Budget[],
  transactions: Transaction[],
  month: string
): MonthlyBudgetOverview {
  const monthBudgets = budgets.filter((b) => b.month === month);
  const overallBudget = monthBudgets.find((b) => b.category_id === null) || null;
  const categoryBudgets = monthBudgets.filter((b) => b.category_id !== null);

  const totalSpentCentavos = calculateSpendingForMonth(transactions, month);

  if (overallBudget) {
    const limit = overallBudget.amount_centavos;
    const remaining = limit - totalSpentCentavos;
    const isExceeded = totalSpentCentavos > limit;
    const percentage = limit > 0 ? (totalSpentCentavos / limit) * 100 : 0;
    const roundedPercentage = Math.round(percentage * 100) / 100;
    const cappedPercentage = Math.min(100, Math.max(0, percentage));
    const status = calculateBudgetStatus(percentage);

    return {
      hasOverallBudget: true,
      overallBudget,
      totalBudgetLimitCentavos: limit,
      totalSpentCentavos,
      remainingCentavos: remaining,
      percentage: roundedPercentage,
      cappedPercentage,
      isExceeded,
      status,
      categoryBudgetsCount: categoryBudgets.length,
    };
  }

  // If no overall budget exists, sum category budgets as a secondary reference
  const categoryLimitsSum = categoryBudgets.reduce(
    (acc, b) => acc + b.amount_centavos,
    0
  );
  const remaining = categoryLimitsSum - totalSpentCentavos;
  const percentage =
    categoryLimitsSum > 0 ? (totalSpentCentavos / categoryLimitsSum) * 100 : 0;

  return {
    hasOverallBudget: false,
    overallBudget: null,
    totalBudgetLimitCentavos: categoryLimitsSum,
    totalSpentCentavos,
    remainingCentavos: remaining,
    percentage: Math.round(percentage * 100) / 100,
    cappedPercentage: Math.min(100, Math.max(0, percentage)),
    isExceeded: categoryLimitsSum > 0 && totalSpentCentavos > categoryLimitsSum,
    status: calculateBudgetStatus(percentage),
    categoryBudgetsCount: categoryBudgets.length,
  };
}
