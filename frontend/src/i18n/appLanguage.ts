import { changeAppLanguage, PREFERENCES_STORAGE_KEY } from './config';
import type { AppLanguage } from './types';

const defaultPrefs = {
  language: 'fr' as AppLanguage,
  notifications: { email: true, push: true, system: true, marketing: false },
  compactMode: false,
  autoSave: true,
  dashboardPersonalization: true,
};

export const readStoredAppLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'fr';
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return 'fr';
    const lang = JSON.parse(raw)?.language;
    if (lang === 'fr' || lang === 'en' || lang === 'ar') return lang;
  } catch {
    /* ignore */
  }
  return 'fr';
};

/** Persists language for the whole app (admin, auth, student) and applies i18n immediately. */
export const persistAppLanguage = async (lang: AppLanguage): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          ...defaultPrefs,
          ...parsed,
          notifications: { ...defaultPrefs.notifications, ...parsed?.notifications },
          language: lang,
        })
      );
    } catch {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ ...defaultPrefs, language: lang }));
    }
    window.dispatchEvent(new CustomEvent('admin-preferences-changed', { detail: { language: lang } }));
  }
  await changeAppLanguage(lang);
};
