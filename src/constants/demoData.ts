/**
 * Centralized Demo Data for Kwarta Dashboard UI
 *
 * NOTE: All monetary amounts are stored as integer centavos (₱1.00 = 100 centavos).
 * This demo data is isolated from the real SQLite database and is only used for UI/UX demonstration
 * when no real user transactions exist or when Demo Mode is explicitly enabled.
 *
 * Mathematical Consistency:
 * - Total Income:   ₱20,000.00 (2,000,000 centavos)
 * - Total Expenses:  ₱7,500.00 (  750,000 centavos)
 * - Total Balance:  ₱12,500.00 (1,250,000 centavos)
 */

import { Transaction, TransactionCategory } from '@/types/finance';

export const DEMO_CATEGORIES: Record<string, TransactionCategory> = {
  income: {
    id: 101,
    name: 'Income',
    icon: 'briefcase',
    color: '#10B981',
    type: 'income',
  },
  food: {
    id: 102,
    name: 'Food & Drinks',
    icon: 'utensils',
    color: '#F87171',
    type: 'expense',
  },
  shopping: {
    id: 103,
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#F472B6',
    type: 'expense',
  },
  transportation: {
    id: 104,
    name: 'Transportation',
    icon: 'car',
    color: '#FB923C',
    type: 'expense',
  },
  bills: {
    id: 105,
    name: 'Bills',
    icon: 'zap',
    color: '#FBBF24',
    type: 'expense',
  },
  other: {
    id: 106,
    name: 'Other',
    icon: 'more-horizontal',
    color: '#94A3B8',
    type: 'expense',
  },
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: 'Monthly Allowance',
    amount: 2000000, // ₱20,000.00 in centavos
    type: 'income',
    category_id: 101,
    category: DEMO_CATEGORIES.income,
    date: '2026-10-22T08:30:00Z',
    payment_method: 'Bank Transfer',
  },
  {
    id: 2,
    description: 'Grocery Shopping',
    amount: 250000, // ₱2,500.00 in centavos
    type: 'expense',
    category_id: 102,
    category: DEMO_CATEGORIES.food,
    date: '2026-10-21T14:15:00Z',
    payment_method: 'Cash',
  },
  {
    id: 3,
    description: 'Online Shopping',
    amount: 200000, // ₱2,000.00 in centavos
    type: 'expense',
    category_id: 103,
    category: DEMO_CATEGORIES.shopping,
    date: '2026-10-20T19:40:00Z',
    payment_method: 'GCash',
  },
  {
    id: 4,
    description: 'Transportation',
    amount: 150000, // ₱1,500.00 in centavos
    type: 'expense',
    category_id: 104,
    category: DEMO_CATEGORIES.transportation,
    date: '2026-10-19T07:50:00Z',
    payment_method: 'Beep Card',
  },
  {
    id: 5,
    description: 'Electricity Bill',
    amount: 100000, // ₱1,000.00 in centavos
    type: 'expense',
    category_id: 105,
    category: DEMO_CATEGORIES.bills,
    date: '2026-10-18T11:20:00Z',
    payment_method: 'Online Banking',
  },
  {
    id: 6,
    description: 'Miscellaneous',
    amount: 50000, // ₱500.00 in centavos
    type: 'expense',
    category_id: 106,
    category: DEMO_CATEGORIES.other,
    date: '2026-10-17T16:05:00Z',
    payment_method: 'Cash',
  },
];
