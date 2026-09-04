import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import type { AppLanguage } from './types';
import { isRtlLanguage } from './types';

export const PREFERENCES_STORAGE_KEY = 'admin-account-preferences';

const loadStoredLanguage = (): AppLanguage => {
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

export const applyDocumentLanguage = (lang: AppLanguage) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
};

const initialLanguage = loadStoredLanguage();
applyDocumentLanguage(initialLanguage);

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Load extended admin translations after i18n init (avoids circular import with config).
import { registerAdminTranslations } from '../features/admin/i18n/registerAdminTranslations';
import { registerStudentTranslations } from '../features/student/i18n/registerStudentTranslations';
import { registerEncadrantTranslations } from '../features/Encadrant/i18n/registerEncadrantTranslations';
import { registerMeetingRoomTranslations } from '../features/shared/meeting-room/i18n/registerMeetingRoomTranslations';
registerAdminTranslations();
registerStudentTranslations();
registerEncadrantTranslations();
registerMeetingRoomTranslations();

export const changeAppLanguage = async (lang: AppLanguage) => {
  applyDocumentLanguage(lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
