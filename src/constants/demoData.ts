/**
 * Centralized Demo Data for Kwarta Dashboard UI
 *
 * NOTE: All monetary amounts are stored as integer centavos (₱1.00 = 100 centavos).
 * This demo data is isolated from the real SQLite database and is only used for UI/UX demonstration
 * when Demo Mode is explicitly enabled in Settings.
 *
 * Mathematical Consistency:
 * - Total Income:   ₱20,000.00 (2,000,000 centavos)
 * - Total Expenses:  ₱7,500.00 (  750,000 centavos)
 * - Total Balance:  ₱12,500.00 (1,250,000 centavos)
 */

import { Transaction, TransactionCategory } from '@/types/finance';

export const DEMO_CATEGORIES: Record<string, TransactionCategory> = {
  income: {
    id: 'cat_inc_salary',
    name: 'Income',
    icon: 'briefcase',
    color: '#10B981',
    type: 'income',
    is_default: 1,
  },
  food: {
    id: 'cat_exp_food_drinks',
    name: 'Food & Drinks',
    icon: 'utensils',
    color: '#F87171',
    type: 'expense',
    is_default: 1,
  },
  shopping: {
    id: 'cat_exp_shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#F472B6',
    type: 'expense',
    is_default: 1,
  },
  transportation: {
    id: 'cat_exp_transportation',
    name: 'Transportation',
    icon: 'car',
    color: '#FB923C',
    type: 'expense',
    is_default: 1,
  },
  bills: {
    id: 'cat_exp_bills_utilities',
    name: 'Bills',
    icon: 'receipt',
    color: '#FBBF24',
    type: 'expense',
    is_default: 1,
  },
  other: {
    id: 'cat_exp_other',
    name: 'Other',
    icon: 'ellipsis',
    color: '#94A3B8',
    type: 'expense',
    is_default: 1,
  },
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo_tx_1',
    title: 'Monthly Allowance',
    description: 'Monthly Allowance',
    amount_centavos: 2000000, // ₱20,000.00 in centavos
    amount: 2000000,
    type: 'income',
    category_id: 'cat_inc_salary',
    category: DEMO_CATEGORIES.income,
    transaction_date: '2026-10-22',
    date: '2026-10-22',
    created_at: '2026-10-22T08:30:00Z',
    updated_at: '2026-10-22T08:30:00Z',
  },
  {
    id: 'demo_tx_2',
    title: 'Grocery Shopping',
    description: 'Grocery Shopping',
    amount_centavos: 250000, // ₱2,500.00 in centavos
    amount: 250000,
    type: 'expense',
    category_id: 'cat_exp_food_drinks',
    category: DEMO_CATEGORIES.food,
    transaction_date: '2026-10-21',
    date: '2026-10-21',
    created_at: '2026-10-21T14:15:00Z',
    updated_at: '2026-10-21T14:15:00Z',
  },
  {
    id: 'demo_tx_3',
    title: 'Online Shopping',
    description: 'Online Shopping',
    amount_centavos: 200000, // ₱2,000.00 in centavos
    amount: 200000,
    type: 'expense',
    category_id: 'cat_exp_shopping',
    category: DEMO_CATEGORIES.shopping,
    transaction_date: '2026-10-20',
    date: '2026-10-20',
    created_at: '2026-10-20T19:40:00Z',
    updated_at: '2026-10-20T19:40:00Z',
  },
  {
    id: 'demo_tx_4',
    title: 'Transportation',
    description: 'Transportation',
    amount_centavos: 150000, // ₱1,500.00 in centavos
    amount: 150000,
    type: 'expense',
    category_id: 'cat_exp_transportation',
    category: DEMO_CATEGORIES.transportation,
    transaction_date: '2026-10-19',
    date: '2026-10-19',
    created_at: '2026-10-19T07:50:00Z',
    updated_at: '2026-10-19T07:50:00Z',
  },
  {
    id: 'demo_tx_5',
    title: 'Electricity Bill',
    description: 'Electricity Bill',
    amount_centavos: 100000, // ₱1,000.00 in centavos
    amount: 100000,
    type: 'expense',
    category_id: 'cat_exp_bills_utilities',
    category: DEMO_CATEGORIES.bills,
    transaction_date: '2026-10-18',
    date: '2026-10-18',
    created_at: '2026-10-18T11:20:00Z',
    updated_at: '2026-10-18T11:20:00Z',
  },
  {
    id: 'demo_tx_6',
    title: 'Miscellaneous',
    description: 'Miscellaneous',
    amount_centavos: 50000, // ₱500.00 in centavos
    amount: 50000,
    type: 'expense',
    category_id: 'cat_exp_other',
    category: DEMO_CATEGORIES.other,
    transaction_date: '2026-10-17',
    date: '2026-10-17',
    created_at: '2026-10-17T16:05:00Z',
    updated_at: '2026-10-17T16:05:00Z',
  },
];
