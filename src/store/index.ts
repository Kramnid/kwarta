/**
 * Global App State Management with Zustand
 * Supports both real SQLite transactions and an isolated Demo Mode.
 */

import { create } from 'zustand';
import { Transaction } from '@/types/finance';
import { DEMO_TRANSACTIONS } from '@/constants/demoData';
import { getDatabase } from '@/database';

interface AppState {
  // Database status
  isDatabaseReady: boolean;
  setDatabaseReady: (ready: boolean) => void;
  dbError: string | null;
  setDbError: (error: string | null) => void;

  // Demo mode vs Real data mode
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;

  // Transactions data
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  refreshTransactions: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDatabaseReady: false,
  setDatabaseReady: (ready: boolean) => {
    set({ isDatabaseReady: ready });
    if (ready) {
      get().refreshTransactions();
    }
  },
  dbError: null,
  setDbError: (error: string | null) => set({ dbError: error }),

  // Default to demo mode if no transactions have been entered yet
  isDemoMode: true,
  setDemoMode: (enabled: boolean) => {
    set({ isDemoMode: enabled });
    get().refreshTransactions();
  },
  toggleDemoMode: () => {
    const next = !get().isDemoMode;
    set({ isDemoMode: next });
    get().refreshTransactions();
  },

  transactions: DEMO_TRANSACTIONS,
  isLoadingTransactions: false,

  refreshTransactions: async () => {
    const { isDemoMode, isDatabaseReady } = get();

    // In demo mode, load centralized demo transactions
    if (isDemoMode) {
      set({ transactions: DEMO_TRANSACTIONS, isLoadingTransactions: false });
      return;
    }

    // In real mode, query SQLite database
    if (!isDatabaseReady) {
      set({ transactions: [] });
      return;
    }

    try {
      set({ isLoadingTransactions: true });
      const db = getDatabase();
      const rows = await db.getAllAsync<Transaction>(
        `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         ORDER BY t.date DESC, t.id DESC;`
      );

      // Map joined fields into category object
      const mappedTransactions: Transaction[] = (rows || []).map((row: any) => ({
        id: row.id,
        amount: row.amount,
        type: row.type,
        category_id: row.category_id,
        description: row.description,
        date: row.date,
        payment_method: row.payment_method,
        is_recurring: row.is_recurring,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_name
          ? {
              id: row.category_id,
              name: row.category_name,
              icon: row.category_icon || 'more-horizontal',
              color: row.category_color || '#94A3B8',
              type: row.type,
            }
          : undefined,
      }));

      set({ transactions: mappedTransactions, isLoadingTransactions: false });
    } catch (error) {
      console.warn('[Kwarta Store] Failed to query transactions from SQLite:', error);
      set({ transactions: [], isLoadingTransactions: false });
    }
  },
}));
