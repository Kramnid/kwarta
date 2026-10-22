/**
 * Pure Financial Calculation Helpers for Kwarta
 *
 * NOTE: All monetary inputs and outputs are in integer centavos to avoid floating-point inaccuracies.
 */

import {
  Transaction,
  DashboardSummary,
  CategorySpending,
  DateGroupedTransactions,
  TransactionFilters,
} from '@/types/finance';
import { formatGroupDate, getTodayLocalDate, isDateInThisWeek, isDateInThisMonth } from './date';

/**
 * Safely extracts positive centavo amount from a transaction.
 */
export function getEffectiveAmount(tx: Transaction): number {
  if (typeof tx.amount_centavos === 'number' && !isNaN(tx.amount_centavos)) {
    return Math.max(0, Math.round(tx.amount_centavos));
  }
  if (typeof tx.amount === 'number' && !isNaN(tx.amount)) {
    return Math.max(0, Math.round(tx.amount));
  }
  return 0;
}

/**
 * Extracts normalized YYYY-MM-DD date string.
 */
export function getEffectiveDate(tx: Transaction): string {
  const d = tx.transaction_date || tx.date || '';
  if (d.includes('T')) {
    return d.split('T')[0];
  }
  return d || getTodayLocalDate();
}

/**
 * Calculates total income from a list of transactions in integer centavos.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'income') {
      return acc + getEffectiveAmount(tx);
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
      return acc + getEffectiveAmount(tx);
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
    string,
    {
      categoryId: string;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      amount: number;
    }
  >();

  for (const tx of expenseTransactions) {
    const categoryId = String(tx.category_id || tx.category?.id || 'other');
    const existing = categoryMap.get(categoryId);

    const name = tx.category?.name || 'Other';
    const icon = tx.category?.icon || 'ellipsis';
    const color = tx.category?.color || '#94A3B8';
    const amount = getEffectiveAmount(tx);

    if (existing) {
      existing.amount += amount;
    } else {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName: name,
        categoryIcon: icon,
        categoryColor: color,
        amount,
      });
    }
  }

  // Convert to array and calculate percentage
  const spendingList: CategorySpending[] = Array.from(categoryMap.values()).map(
    (item) => {
      const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
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
export function sortTransactionsByDate(
  transactions: Transaction[],
  direction: 'desc' | 'asc' = 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = getEffectiveDate(a);
    const dateB = getEffectiveDate(b);

    if (dateA !== dateB) {
      return direction === 'desc'
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
    }

    const idA = String(a.id || '');
    const idB = String(b.id || '');
    return direction === 'desc'
      ? idB.localeCompare(idA)
      : idA.localeCompare(idB);
  });
}

/**
 * Sorts transactions by amount (centavos).
 */
export function sortTransactionsByAmount(
  transactions: Transaction[],
  direction: 'desc' | 'asc' = 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const amountA = getEffectiveAmount(a);
    const amountB = getEffectiveAmount(b);

    if (amountA !== amountB) {
      return direction === 'desc' ? amountB - amountA : amountA - amountB;
    }

    // Secondary sort by date descending
    const dateA = getEffectiveDate(a);
    const dateB = getEffectiveDate(b);
    return dateB.localeCompare(dateA);
  });
}

/**
 * Returns the most recent transactions up to the specified limit.
 */
export function getRecentTransactions(
  transactions: Transaction[],
  limit: number = 5
): Transaction[] {
  const sorted = sortTransactionsByDate(transactions, 'desc');
  return sorted.slice(0, Math.max(0, limit));
}

/**
 * Filters a list of transactions in-memory based on user criteria.
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let result = [...transactions];

  // 1. Search Query filter (title or note)
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.trim().toLowerCase();
    result = result.filter((tx) => {
      const titleMatch = (tx.title || tx.description || '')
        .toLowerCase()
        .includes(query);
      const noteMatch = (tx.note || '').toLowerCase().includes(query);
      const categoryMatch = (tx.category?.name || '')
        .toLowerCase()
        .includes(query);
      return titleMatch || noteMatch || categoryMatch;
    });
  }

  // 2. Type Filter (all, income, expense)
  if (filters.type && filters.type !== 'all') {
    result = result.filter((tx) => tx.type === filters.type);
  }

  // 3. Category Filter
  if (filters.categoryId && filters.categoryId !== 'all') {
    result = result.filter((tx) => {
      const catId = String(tx.category_id || tx.category?.id || '');
      return catId === filters.categoryId;
    });
  }

  // 4. Date Filter
  if (filters.dateFilter && filters.dateFilter !== 'all') {
    const today = getTodayLocalDate();
    if (filters.dateFilter === 'today') {
      result = result.filter((tx) => getEffectiveDate(tx) === today);
    } else if (filters.dateFilter === 'this_week') {
      result = result.filter((tx) => isDateInThisWeek(getEffectiveDate(tx)));
    } else if (filters.dateFilter === 'this_month') {
      result = result.filter((tx) => isDateInThisMonth(getEffectiveDate(tx)));
    } else if (filters.dateFilter === 'custom') {
      if (filters.startDate) {
        result = result.filter((tx) => getEffectiveDate(tx) >= filters.startDate!);
      }
      if (filters.endDate) {
        result = result.filter((tx) => getEffectiveDate(tx) <= filters.endDate!);
      }
    }
  }

  // 5. Sorting
  const sortBy = filters.sortBy || 'date_desc';
  switch (sortBy) {
    case 'date_desc':
      return sortTransactionsByDate(result, 'desc');
    case 'date_asc':
      return sortTransactionsByDate(result, 'asc');
    case 'amount_desc':
      return sortTransactionsByAmount(result, 'desc');
    case 'amount_asc':
      return sortTransactionsByAmount(result, 'asc');
    default:
      return sortTransactionsByDate(result, 'desc');
  }
}

/**
 * Groups transactions by calendar date (YYYY-MM-DD), preserving chronological order.
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): DateGroupedTransactions[] {
  const groupsMap = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const dateStr = getEffectiveDate(tx);
    const existing = groupsMap.get(dateStr);
    if (existing) {
      existing.push(tx);
    } else {
      groupsMap.set(dateStr, [tx]);
    }
  }

  const result: DateGroupedTransactions[] = [];

  for (const [dateStr, txList] of groupsMap.entries()) {
    let income = 0;
    let expense = 0;

    for (const tx of txList) {
      const amt = getEffectiveAmount(tx);
      if (tx.type === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    }

    result.push({
      date: dateStr,
      title: formatGroupDate(dateStr),
      transactions: txList,
      totalIncomeCentavos: income,
      totalExpensesCentavos: expense,
    });
  }

  return result;
}
