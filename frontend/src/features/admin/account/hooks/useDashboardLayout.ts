import { useCallback, useEffect, useState } from 'react';
import { useAdminPreferences } from '../context/AdminPreferencesContext';

export type DashboardSectionId = 'stats' | 'alerts-row' | 'overview';

const STORAGE_KEY = 'admin-dashboard-section-order';

export const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionId[] = ['stats', 'overview', 'alerts-row'];

const LEGACY_DASHBOARD_SECTIONS: DashboardSectionId[] = ['stats', 'alerts-row', 'overview'];

const isSameOrder = (a: DashboardSectionId[], b: DashboardSectionId[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const loadOrder = (): DashboardSectionId[] => {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_SECTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD_SECTIONS;
    const parsed = JSON.parse(raw) as DashboardSectionId[];
    const valid = parsed.filter((id) => DEFAULT_DASHBOARD_SECTIONS.includes(id));
    if (valid.length !== DEFAULT_DASHBOARD_SECTIONS.length) return DEFAULT_DASHBOARD_SECTIONS;
    if (isSameOrder(valid, LEGACY_DASHBOARD_SECTIONS)) return DEFAULT_DASHBOARD_SECTIONS;
    return valid;
  } catch {
    return DEFAULT_DASHBOARD_SECTIONS;
  }
};

export const useDashboardLayout = () => {
  const { preferences } = useAdminPreferences();
  const [order, setOrder] = useState<DashboardSectionId[]>(loadOrder);

  useEffect(() => {
    if (!preferences.dashboardPersonalization) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    window.dispatchEvent(new Event('admin-dashboard-layout-changed'));
  }, [order, preferences.dashboardPersonalization]);

  useEffect(() => {
    const syncFromStorage = () => setOrder(loadOrder());
    window.addEventListener('admin-dashboard-layout-changed', syncFromStorage);
    return () => window.removeEventListener('admin-dashboard-layout-changed', syncFromStorage);
  }, []);

  const effectiveOrder = preferences.dashboardPersonalization ? order : DEFAULT_DASHBOARD_SECTIONS;

  const moveSection = useCallback((id: DashboardSectionId, direction: 'up' | 'down') => {
    setOrder((prev) => {
      const index = prev.indexOf(id);
      if (index === -1) return prev;
      const next = [...prev];
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(DEFAULT_DASHBOARD_SECTIONS);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('admin-dashboard-layout-changed'));
  }, []);

  const applyOrder = useCallback(
    (next: DashboardSectionId[], personalizeOverride?: boolean) => {
      setOrder(next);
      const personalize = personalizeOverride ?? preferences.dashboardPersonalization;
      if (personalize) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      window.dispatchEvent(new Event('admin-dashboard-layout-changed'));
    },
    [preferences.dashboardPersonalization]
  );

  return {
    sectionOrder: effectiveOrder,
    storedOrder: order,
    canPersonalize: preferences.dashboardPersonalization,
    moveSection,
    resetOrder,
    applyOrder,
  };
};
