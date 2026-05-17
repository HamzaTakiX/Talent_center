import { FunctionComponent, ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { applyDocumentLanguage, changeAppLanguage } from './config';
import { readStoredAppLanguage } from './appLanguage';
import type { AppLanguage } from './types';

interface LanguageProviderProps {
  children: ReactNode;
}

/** Keeps <html lang/dir> in sync when language changes outside preferences. */
const DocumentLanguageSync: FunctionComponent = () => {
  useEffect(() => {
    const handler = (lang: string) => {
      if (lang === 'fr' || lang === 'en' || lang === 'ar') {
        applyDocumentLanguage(lang as AppLanguage);
      }
    };
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = readStoredAppLanguage();
      if (i18n.language !== stored) {
        void changeAppLanguage(stored);
      }
    };
    syncFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin-account-preferences') syncFromStorage();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('admin-preferences-changed', syncFromStorage);
    window.addEventListener('admin-settings-applied', syncFromStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('admin-preferences-changed', syncFromStorage);
      window.removeEventListener('admin-settings-applied', syncFromStorage);
    };
  }, []);

  return null;
};

const LanguageProvider: FunctionComponent<LanguageProviderProps> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <DocumentLanguageSync />
    {children}
  </I18nextProvider>
);

export default LanguageProvider;
