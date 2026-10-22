/**
 * Zustand Store for Budget Management in Kwarta
 *
 * Persists budgets to SQLite as the source of truth and reactive state for UI screens.
 */

import { create } from 'zustand';
import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '@/types/budget';
import {
  getAllBudgets,
  insertBudget as dbInsertBudget,
  updateBudget as dbUpdateBudget,
  deleteBudget as dbDeleteBudget,
} from '@/database/budgets';
import {
  getCurrentMonthString,
  getPreviousMonthString,
  getNextMonthString,
} from '@/utils/budget';
import { useAppStore } from './index';

interface BudgetState {
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetToCurrentMonth: () => void;

  budgets: Budget[];
  isLoadingBudgets: boolean;
  budgetError: string | null;

  refreshBudgets: () => Promise<void>;
  createBudget: (input: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (id: string, input: UpdateBudgetInput) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<boolean>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  selectedMonth: getCurrentMonthString(),

  setSelectedMonth: (month: string) => {
    set({ selectedMonth: month });
  },

  goToPreviousMonth: () => {
    set((state) => ({
      selectedMonth: getPreviousMonthString(state.selectedMonth),
    }));
  },

  goToNextMonth: () => {
    set((state) => ({
      selectedMonth: getNextMonthString(state.selectedMonth),
    }));
  },

  resetToCurrentMonth: () => {
    set({ selectedMonth: getCurrentMonthString() });
  },

  budgets: [],
  isLoadingBudgets: false,
  budgetError: null,

  refreshBudgets: async () => {
    const isReady = useAppStore.getState().isDatabaseReady;
    if (!isReady) {
      return;
    }

    try {
      set({ isLoadingBudgets: true, budgetError: null });
      const loaded = await getAllBudgets();
      set({ budgets: loaded, isLoadingBudgets: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[Kwarta Budget Store] Failed to load budgets:', message);
      set({ budgetError: message, isLoadingBudgets: false });
    }
  },

  createBudget: async (input: CreateBudgetInput) => {
    const isReady = useAppStore.getState().isDatabaseReady;
    if (!isReady) {
      throw new Error('Database is not initialized.');
    }

    const created = await dbInsertBudget(input);
    await get().refreshBudgets();
    return created;
  },

  updateBudget: async (id: string, input: UpdateBudgetInput) => {
    const isReady = useAppStore.getState().isDatabaseReady;
    if (!isReady) {
      throw new Error('Database is not initialized.');
    }

    const updated = await dbUpdateBudget(id, input);
    await get().refreshBudgets();
    return updated;
  },

  deleteBudget: async (id: string) => {
    const isReady = useAppStore.getState().isDatabaseReady;
    if (!isReady) {
      throw new Error('Database is not initialized.');
    }

    const success = await dbDeleteBudget(id);
    if (success) {
      await get().refreshBudgets();
    }
    return success;
  },
}));
