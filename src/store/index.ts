/**
 * Global State Management with Zustand for Kwarta
 * Connects SQLite persistent transactions directly to reactive application state.
 */

import { create } from 'zustand';
import {
  Transaction,
  TransactionCategory,
  CreateTransactionInput,
  TransactionFilters,
} from '@/types/finance';
import { DEMO_TRANSACTIONS } from '@/constants/demoData';
import {
  getAllTransactions,
  insertTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  getAllCategories,
} from '@/database';
import { useBudgetStore } from './useBudgetStore';
import { useSavingsStore } from './useSavingsStore';
import { useSettingsStore } from './useSettingsStore';

interface FinanceState {
  // Database status
  isDatabaseReady: boolean;
  setDatabaseReady: (ready: boolean) => void;
  dbError: string | null;
  setDbError: (error: string | null) => void;

  // Demo mode (Default is FALSE: production connects to real SQLite records)
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;

  // Data collections
  transactions: Transaction[];
  categories: TransactionCategory[];
  isLoadingTransactions: boolean;
  isLoadingCategories: boolean;

  // Privacy mode (mask sensitive currency balances)
  isBalanceHidden: boolean;
  setBalanceHidden: (hidden: boolean) => void;
  toggleBalanceHidden: () => void;

  // Filter and search state for Transactions screen
  filters: TransactionFilters;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;

  // CRUD actions
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  addTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  editTransaction: (
    id: string,
    input: Partial<CreateTransactionInput>
  ) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<boolean>;
}

const DEFAULT_FILTERS: TransactionFilters = {
  searchQuery: '',
  type: 'all',
  categoryId: 'all',
  dateFilter: 'all',
  sortBy: 'date_desc',
};

export const useAppStore = create<FinanceState>((set, get) => ({
  isDatabaseReady: false,
  setDatabaseReady: (ready: boolean) => {
    set({ isDatabaseReady: ready });
    if (ready) {
      get().refreshCategories();
      get().refreshTransactions();
      useBudgetStore.getState().refreshBudgets();
      useSavingsStore.getState().refreshSavings();
      useSettingsStore.getState().loadSettings();
    }
  },
  dbError: null,
  setDbError: (error: string | null) => set({ dbError: error }),

  // Default is false: Step 3 connects to real SQLite transactions!
  isDemoMode: false,
  setDemoMode: (enabled: boolean) => {
    set({ isDemoMode: enabled });
    get().refreshTransactions();
    useBudgetStore.getState().refreshBudgets();
  },
  toggleDemoMode: () => {
    const next = !get().isDemoMode;
    set({ isDemoMode: next });
    get().refreshTransactions();
    useBudgetStore.getState().refreshBudgets();
  },

  transactions: [],
  categories: [],
  isLoadingTransactions: false,
  isLoadingCategories: false,

  isBalanceHidden: false,
  setBalanceHidden: (hidden: boolean) => set({ isBalanceHidden: hidden }),
  toggleBalanceHidden: () => set((state) => ({ isBalanceHidden: !state.isBalanceHidden })),

  filters: DEFAULT_FILTERS,
  setFilters: (partial) => {
    set({
      filters: {
        ...get().filters,
        ...partial,
      },
    });
  },
  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  refreshCategories: async () => {
    const { isDatabaseReady } = get();
    if (!isDatabaseReady) return;

    try {
      set({ isLoadingCategories: true });
      const cats = await getAllCategories();
      set({ categories: cats, isLoadingCategories: false });
    } catch (error) {
      console.warn('[Kwarta Store] Failed to load categories:', error);
      set({ isLoadingCategories: false });
    }
  },

  refreshTransactions: async () => {
    const { isDemoMode, isDatabaseReady } = get();

    if (isDemoMode) {
      set({ transactions: DEMO_TRANSACTIONS, isLoadingTransactions: false });
      return;
    }

    if (!isDatabaseReady) {
      set({ transactions: [] });
      return;
    }

    try {
      set({ isLoadingTransactions: true });
      const txs = await getAllTransactions();
      set({ transactions: txs, isLoadingTransactions: false });
    } catch (error) {
      console.warn('[Kwarta Store] Failed to load transactions:', error);
      set({ transactions: [], isLoadingTransactions: false });
    }
  },

  addTransaction: async (input: CreateTransactionInput) => {
    const { isDatabaseReady } = get();
    if (!isDatabaseReady) {
      throw new Error('Database is not initialized.');
    }

    const created = await insertTransaction(input);
    // Refresh the in-memory state so dashboard and all screens react immediately
    await get().refreshTransactions();
    // Refresh budgets so budget progress updates immediately
    await useBudgetStore.getState().refreshBudgets();
    return created;
  },

  editTransaction: async (
    id: string,
    input: Partial<CreateTransactionInput>
  ) => {
    const { isDatabaseReady } = get();
    if (!isDatabaseReady) {
      throw new Error('Database is not initialized.');
    }

    const updated = await dbUpdateTransaction(id, input);
    await get().refreshTransactions();
    await useBudgetStore.getState().refreshBudgets();
    return updated;
  },

  removeTransaction: async (id: string) => {
    const { isDatabaseReady } = get();
    if (!isDatabaseReady) {
      throw new Error('Database is not initialized.');
    }

    const success = await dbDeleteTransaction(id);
    if (success) {
      await get().refreshTransactions();
      await useBudgetStore.getState().refreshBudgets();
    }
    return success;
  },
}));

// Export alias for architectures looking for useFinanceStore
export const useFinanceStore = useAppStore;
export { useBudgetStore, useSavingsStore, useSettingsStore };
