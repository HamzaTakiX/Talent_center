import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { changeAppLanguage } from '../../../../i18n/config';
import { persistAppLanguage } from '../../../../i18n/appLanguage';
import type { AdminLanguage, AdminPreferences } from '../types';

const STORAGE_KEY = 'admin-account-preferences';

export const defaultAdminPreferences: AdminPreferences = {
  language: 'fr',
  notifications: {
    email: true,
    push: true,
    system: true,
    marketing: false,
  },
  compactMode: false,
  autoSave: true,
  dashboardPersonalization: true,
};

const loadPreferences = (): AdminPreferences => {
  if (typeof window === 'undefined') return defaultAdminPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdminPreferences;
    const parsed = JSON.parse(raw) as Partial<AdminPreferences>;
    return {
      ...defaultAdminPreferences,
      ...parsed,
      notifications: {
        ...defaultAdminPreferences.notifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return defaultAdminPreferences;
  }
};

interface AdminPreferencesContextValue {
  preferences: AdminPreferences;
  hydrated: boolean;
  setLanguage: (language: AdminLanguage) => void;
  setNotification: (key: keyof AdminPreferences['notifications'], value: boolean) => void;
  setCompactMode: (compactMode: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setDashboardPersonalization: (dashboardPersonalization: boolean) => void;
  applyPreferences: (next: AdminPreferences) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const AdminPreferencesContext = createContext<AdminPreferencesContextValue | null>(null);

export const AdminPreferencesProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AdminPreferences>(defaultAdminPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    void changeAppLanguage(loaded.language);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent('admin-preferences-changed', { detail: preferences }));
  }, [preferences, hydrated]);

  const setLanguage = useCallback((language: AdminLanguage) => {
    setPreferences((p) => ({ ...p, language }));
    void persistAppLanguage(language);
  }, []);

  const setNotification = useCallback(
    (key: keyof AdminPreferences['notifications'], value: boolean) => {
      setPreferences((p) => ({
        ...p,
        notifications: { ...p.notifications, [key]: value },
      }));
    },
    []
  );

  const setCompactMode = useCallback((compactMode: boolean) => {
    setPreferences((p) => ({ ...p, compactMode }));
  }, []);

  const setAutoSave = useCallback((autoSave: boolean) => {
    setPreferences((p) => ({ ...p, autoSave }));
  }, []);

  const setDashboardPersonalization = useCallback((dashboardPersonalization: boolean) => {
    setPreferences((p) => ({ ...p, dashboardPersonalization }));
  }, []);

  const applyPreferences = useCallback(async (next: AdminPreferences) => {
    setPreferences(next);
    await persistAppLanguage(next.language);
    window.dispatchEvent(new CustomEvent('admin-settings-applied', { detail: next }));
  }, []);

  const resetPreferences = useCallback(async () => {
    setPreferences(defaultAdminPreferences);
    await changeAppLanguage(defaultAdminPreferences.language);
    window.dispatchEvent(
      new CustomEvent('admin-settings-applied', { detail: defaultAdminPreferences })
    );
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      setLanguage,
      setNotification,
      setCompactMode,
      setAutoSave,
      setDashboardPersonalization,
      applyPreferences,
      resetPreferences,
    }),
    [
      preferences,
      hydrated,
      setLanguage,
      setNotification,
      setCompactMode,
      setAutoSave,
      setDashboardPersonalization,
      applyPreferences,
      resetPreferences,
    ]
  );

  return (
    <AdminPreferencesContext.Provider value={value}>{children}</AdminPreferencesContext.Provider>
  );
};

export const useAdminPreferences = (): AdminPreferencesContextValue => {
  const ctx = useContext(AdminPreferencesContext);
  if (ctx == null) {
    throw new Error('useAdminPreferences must be used within AdminPreferencesProvider');
  }
  return ctx;
};
