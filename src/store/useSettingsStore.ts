/**
 * Zustand Store for Kwarta Settings, Preferences, and Data Management
 */

import { create } from 'zustand';
import {
  AppSettings,
  AppearanceMode,
  DateFormatOption,
} from '@/types/settings';
import {
  getAllSettings,
  setSetting,
  clearAllFinancialData,
} from '@/database/settings';

interface SettingsState extends AppSettings {
  isLoadingSettings: boolean;
  loadSettings: () => Promise<void>;
  updateProfile: (displayName: string, profileInitials?: string) => Promise<void>;
  updateAppearance: (appearance: AppearanceMode) => Promise<void>;
  updateDateFormat: (dateFormat: DateFormatOption) => Promise<void>;
  updateAppLock: (isAppLockEnabled: boolean) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  displayName: '',
  profileInitials: '',
  appearance: 'dark',
  currency: 'PHP',
  dateFormat: 'MM/DD/YYYY',
  isAppLockEnabled: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoadingSettings: false,

  loadSettings: async () => {
    try {
      set({ isLoadingSettings: true });
      const raw = await getAllSettings();

      set({
        displayName: raw.display_name || '',
        profileInitials: raw.profile_initials || '',
        appearance: (raw.appearance as AppearanceMode) || 'dark',
        currency: raw.currency || 'PHP',
        dateFormat: (raw.date_format as DateFormatOption) || 'MM/DD/YYYY',
        isAppLockEnabled: raw.app_lock_enabled === 'true',
        isLoadingSettings: false,
      });
    } catch (error) {
      console.warn('[Kwarta Settings] Failed to load settings from SQLite:', error);
      set({ isLoadingSettings: false });
    }
  },

  updateProfile: async (displayName: string, profileInitials?: string) => {
    const trimmedName = displayName.trim();
    let initials = (profileInitials || '').trim().toUpperCase();

    // Auto-derive initials if not provided
    if (!initials && trimmedName) {
      const parts = trimmedName.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        initials = parts[0].substring(0, 2).toUpperCase();
      } else if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
    }

    await setSetting('display_name', trimmedName);
    await setSetting('profile_initials', initials);

    set({
      displayName: trimmedName,
      profileInitials: initials,
    });
  },

  updateAppearance: async (appearance: AppearanceMode) => {
    await setSetting('appearance', appearance);
    set({ appearance });
  },

  updateDateFormat: async (dateFormat: DateFormatOption) => {
    await setSetting('date_format', dateFormat);
    set({ dateFormat });
  },

  updateAppLock: async (isAppLockEnabled: boolean) => {
    await setSetting('app_lock_enabled', isAppLockEnabled ? 'true' : 'false');
    set({ isAppLockEnabled });
  },

  resetAllData: async () => {
    await clearAllFinancialData();
    set({ ...DEFAULT_SETTINGS });
  },
}));
