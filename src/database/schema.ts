/**
 * Kwarta Database Schema Definitions & Default Seeds
 * All monetary amounts are stored as integer centavos to prevent floating point inaccuracies.
 */

import { TransactionCategory } from '@/types/finance';

export const DATABASE_NAME = 'kwarta.db';
export const CURRENT_SCHEMA_VERSION = 5;

export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  // Expense Categories
  {
    id: 'cat_exp_food_drinks',
    name: 'Food & Drinks',
    icon: 'utensils',
    color: '#F87171',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_transportation',
    name: 'Transportation',
    icon: 'car',
    color: '#FB923C',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#F472B6',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_bills_utilities',
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#FBBF24',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_entertainment',
    name: 'Entertainment',
    icon: 'gamepad-2',
    color: '#818CF8',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_health',
    name: 'Health',
    icon: 'heart-pulse',
    color: '#38BDF8',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_education',
    name: 'Education',
    icon: 'graduation-cap',
    color: '#34D399',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_groceries',
    name: 'Groceries',
    icon: 'shopping-cart',
    color: '#10B981',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_personal_care',
    name: 'Personal Care',
    icon: 'sparkles',
    color: '#E879F9',
    type: 'expense',
    is_default: 1,
  },
  {
    id: 'cat_exp_other',
    name: 'Other',
    icon: 'ellipsis',
    color: '#94A3B8',
    type: 'expense',
    is_default: 1,
  },

  // Income Categories
  {
    id: 'cat_inc_salary',
    name: 'Salary',
    icon: 'briefcase',
    color: '#10B981',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_allowance',
    name: 'Allowance',
    icon: 'wallet',
    color: '#34D399',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_freelance',
    name: 'Freelance',
    icon: 'laptop',
    color: '#059669',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_business',
    name: 'Business',
    icon: 'store',
    color: '#06B6D4',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_gifts',
    name: 'Gifts',
    icon: 'gift',
    color: '#60A5FA',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_investments',
    name: 'Investments',
    icon: 'trending-up',
    color: '#A78BFA',
    type: 'income',
    is_default: 1,
  },
  {
    id: 'cat_inc_other',
    name: 'Other Income',
    icon: 'circle-dollar-sign',
    color: '#64748B',
    type: 'income',
    is_default: 1,
  },
];
