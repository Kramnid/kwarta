/**
 * Kwarta TypeScript Type Definitions
 */

export * from './finance';
export * from './budget';
export * from './analytics';
export * from './savings';
export * from './settings';

export interface Category {
  id: string | number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: number;
  created_at: string;
}

export interface DatabaseInitResult {
  success: boolean;
  version?: number;
  error?: string;
}
