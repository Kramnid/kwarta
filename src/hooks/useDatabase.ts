/**
 * React hook to initialize and monitor the local SQLite database
 */

import { useEffect, useState } from 'react';
import { initDatabase } from '@/database';
import { useAppStore, useSettingsStore, useAccountsStore } from '@/store';

export function useDatabase() {
  const { isDatabaseReady, setDatabaseReady, dbError, setDbError } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(!isDatabaseReady);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (isDatabaseReady) {
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      const result = await initDatabase();

      if (!isMounted) return;

      if (result.success) {
        setDatabaseReady(true);
        setDbError(null);
        // Load persisted settings, user profile, and account cards into state
        useSettingsStore.getState().loadSettings();
        useAccountsStore.getState().loadCards();
      } else {
        setDatabaseReady(false);
        setDbError(result.error ?? 'Unknown database error');
      }
      setIsInitializing(false);
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isDatabaseReady, setDatabaseReady, setDbError]);

  return {
    isReady: isDatabaseReady,
    isLoading: isInitializing,
    error: dbError,
  };
}
