/**
 * Pure Financial Calculation Helpers for Kwarta
 *
 * NOTE: All monetary inputs and outputs are in integer centavos to avoid floating-point inaccuracies.
 */

import {
  Transaction,
  DashboardSummary,
  CategorySpending,
} from '@/types/finance';

/**
 * Calculates total income from a list of transactions in integer centavos.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'income') {
      return acc + (tx.amount || 0);
    }
    return acc;
  }, 0);
}

/**
 * Calculates total expenses from a list of transactions in integer centavos.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'expense') {
      return acc + (tx.amount || 0);
    }
    return acc;
  }, 0);
}

/**
 * Calculates net balance (Total Income - Total Expenses) in integer centavos.
 */
export function calculateTotalBalance(transactions: Transaction[]): number {
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  return totalIncome - totalExpenses;
}

/**
 * Returns a consolidated summary object for the dashboard.
 */
export function calculateDashboardSummary(transactions: Transaction[]): DashboardSummary {
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  return {
    totalIncome,
    totalExpenses,
    totalBalance: totalIncome - totalExpenses,
  };
}

/**
 * Calculates spending breakdown by category with percentage distribution.
 * Safely guards against division by zero (returns 0% if total expenses are 0).
 */
export function calculateSpendingByCategory(
  transactions: Transaction[]
): CategorySpending[] {
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');
  const totalExpenses = calculateTotalExpenses(transactions);

  if (expenseTransactions.length === 0 || totalExpenses <= 0) {
    return [];
  }

  // Aggregate expenses by category
  const categoryMap = new Map<
    number,
    {
      categoryId: number;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      amount: number;
    }
  >();

  for (const tx of expenseTransactions) {
    const categoryId = tx.category_id || 0;
    const existing = categoryMap.get(categoryId);

    const name = tx.category?.name || 'Other';
    const icon = tx.category?.icon || 'more-horizontal';
    const color = tx.category?.color || '#94A3B8';

    if (existing) {
      existing.amount += tx.amount || 0;
    } else {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName: name,
        categoryIcon: icon,
        categoryColor: color,
        amount: tx.amount || 0,
      });
    }
  }

  // Convert to array and calculate percentage
  const spendingList: CategorySpending[] = Array.from(categoryMap.values()).map(
    (item) => {
      const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
      // Round to 1 decimal place safely
      const roundedPercentage = Math.round(percentage * 10) / 10;
      return {
        ...item,
        percentage: isNaN(roundedPercentage) ? 0 : roundedPercentage,
      };
    }
  );

  // Sort descending by amount
  return spendingList.sort((a, b) => b.amount - a.amount);
}

/**
 * Deterministically sorts transactions by date descending (newest first).
 * In case of equal dates, uses transaction ID descending as secondary tie-breaker.
 */
export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();

    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }

    return (b.id || 0) - (a.id || 0);
  });
}

/**
 * Returns the most recent transactions up to the specified limit.
 */
export function getRecentTransactions(
  transactions: Transaction[],
  limit: number = 5
): Transaction[] {
  const sorted = sortTransactionsByDate(transactions);
  return sorted.slice(0, Math.max(0, limit));
}
