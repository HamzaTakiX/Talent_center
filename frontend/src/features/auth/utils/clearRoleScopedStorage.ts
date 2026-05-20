import { clearOnboardingCvPending } from './onboardingCvGate';

const ADMIN_UI_KEYS = [
  'admin-account-preferences',
  'admin-dashboard-theme',
  'admin-dashboard-section-order',
  'admin-global-search-recents',
  'admin-global-search-visited',
] as const;

/** Clears persisted UI state that must not leak across roles or sessions. */
export function clearRoleScopedStorage(): void {
  clearOnboardingCvPending();
  try {
    for (const key of ADMIN_UI_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* private mode / quota */
  }
}
