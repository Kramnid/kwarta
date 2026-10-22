/**
 * Global App State Management with Zustand
 */

import { create } from 'zustand';

interface AppState {
  isDatabaseReady: boolean;
  setDatabaseReady: (ready: boolean) => void;
  dbError: string | null;
  setDbError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDatabaseReady: false,
  setDatabaseReady: (ready: boolean) => set({ isDatabaseReady: ready }),
  dbError: null,
  setDbError: (error: string | null) => set({ dbError: error }),
}));
