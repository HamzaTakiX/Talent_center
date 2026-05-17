import { useCallback } from 'react';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';
import { useAdminPreferences } from '../context/AdminPreferencesContext';
import type { AdminPreferences } from '../types';
import { type DashboardSectionId, useDashboardLayout } from './useDashboardLayout';

export interface AdminSettingsBundle {
  preferences: AdminPreferences;
  theme: 'light' | 'dark';
  dashboardOrder: DashboardSectionId[];
}

/** Applies language, theme, compact mode, notifications, and dashboard layout app-wide. */
export const useApplyAdminSettings = () => {
  const { applyPreferences } = useAdminPreferences();
  const { setTheme } = useAdminTheme();
  const { applyOrder } = useDashboardLayout();

  return useCallback(
    async (bundle: AdminSettingsBundle) => {
      await applyPreferences(bundle.preferences);
      setTheme(bundle.theme);
      applyOrder(bundle.dashboardOrder, bundle.preferences.dashboardPersonalization);
    },
    [applyPreferences, applyOrder, setTheme]
  );
};
