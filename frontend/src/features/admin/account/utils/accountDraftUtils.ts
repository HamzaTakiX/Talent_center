import type { AdminPreferences } from '../types';
import type { DashboardSectionId } from '../hooks/useDashboardLayout';

export const areAdminPreferencesEqual = (a: AdminPreferences, b: AdminPreferences): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export const areDashboardOrdersEqual = (a: DashboardSectionId[], b: DashboardSectionId[]): boolean =>
  a.length === b.length && a.every((id, i) => id === b[i]);
