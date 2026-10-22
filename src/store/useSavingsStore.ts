/**
 * Zustand Store for Savings Goals in Kwarta
 *
 * Persists savings goals and allocation entries to SQLite as the source of truth
 * and provides reactive state for UI screens and widgets.
 */

import { create } from 'zustand';
import {
  SavingsGoal,
  SavingsEntry,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateSavingsEntryInput,
} from '@/types/savings';
import {
  getAllSavingsGoals,
  insertSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getSavingsEntriesByGoalId,
  insertSavingsEntry,
  deleteSavingsEntry,
} from '@/database/savings';

interface SavingsState {
  savingsGoals: SavingsGoal[];
  savingsEntries: Record<string, SavingsEntry[]>;
  isLoadingSavings: boolean;
  savingsError: string | null;

  refreshSavings: () => Promise<void>;
  loadEntriesForGoal: (goalId: string) => Promise<SavingsEntry[]>;
  createGoal: (input: CreateSavingsGoalInput) => Promise<SavingsGoal>;
  updateGoal: (id: string, input: UpdateSavingsGoalInput) => Promise<SavingsGoal>;
  deleteGoal: (id: string) => Promise<boolean>;
  addEntry: (input: CreateSavingsEntryInput) => Promise<SavingsEntry>;
  removeEntry: (goalId: string, entryId: string) => Promise<boolean>;
  getGoalById: (id: string) => SavingsGoal | undefined;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  savingsGoals: [],
  savingsEntries: {},
  isLoadingSavings: false,
  savingsError: null,

  getGoalById: (id: string) => {
    return get().savingsGoals.find((g) => g.id === id);
  },

  refreshSavings: async () => {
    try {
      set({ isLoadingSavings: true, savingsError: null });
      const loaded = await getAllSavingsGoals();
      set({ savingsGoals: loaded, isLoadingSavings: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[Kwarta Savings Store] Failed to load savings goals:', message);
      set({ savingsError: message, isLoadingSavings: false });
    }
  },

  loadEntriesForGoal: async (goalId: string) => {
    try {
      const entries = await getSavingsEntriesByGoalId(goalId);
      set((state) => ({
        savingsEntries: {
          ...state.savingsEntries,
          [goalId]: entries,
        },
      }));
      return entries;
    } catch (error) {
      console.warn(
        `[Kwarta Savings Store] Failed to load entries for goal "${goalId}":`,
        error
      );
      return [];
    }
  },

  createGoal: async (input: CreateSavingsGoalInput) => {
    const created = await insertSavingsGoal(input);
    await get().refreshSavings();
    return created;
  },

  updateGoal: async (id: string, input: UpdateSavingsGoalInput) => {
    const updated = await updateSavingsGoal(id, input);
    await get().refreshSavings();
    return updated;
  },

  deleteGoal: async (id: string) => {
    const success = await deleteSavingsGoal(id);
    if (success) {
      set((state) => {
        const nextEntries = { ...state.savingsEntries };
        delete nextEntries[id];
        return {
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
          savingsEntries: nextEntries,
        };
      });
      await get().refreshSavings();
    }
    return success;
  },

  addEntry: async (input: CreateSavingsEntryInput) => {
    const created = await insertSavingsEntry(input);
    // Refresh both the entries and the goals so allocated amounts update everywhere
    await Promise.all([
      get().loadEntriesForGoal(input.goal_id),
      get().refreshSavings(),
    ]);
    return created;
  },

  removeEntry: async (goalId: string, entryId: string) => {
    const success = await deleteSavingsEntry(entryId);
    if (success) {
      await Promise.all([
        get().loadEntriesForGoal(goalId),
        get().refreshSavings(),
      ]);
    }
    return success;
  },
}));
