import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { persistAppLanguage, readStoredAppLanguage } from '../../../../i18n/appLanguage';
import { APP_LANGUAGES, type AppLanguage } from '../../../../i18n/types';

const LABELS: Record<AppLanguage, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'ع',
};

const AdminLanguageSwitcher: FunctionComponent = () => {
  const { i18n, t } = useTranslation();
  const current = (
    APP_LANGUAGES.includes(i18n.language as AppLanguage)
      ? i18n.language
      : readStoredAppLanguage()
  ) as AppLanguage;

  const select = (lang: AppLanguage) => {
    if (lang === current) return;
    void persistAppLanguage(lang);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.04, duration: 0.2 }}
      role="group"
      aria-label={t('common.language')}
      className="admin-lang-switch inline-flex shrink-0 items-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-0.5 shadow-sm"
    >
      {APP_LANGUAGES.map((lang) => {
        const active = current === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => select(lang)}
            aria-pressed={active}
            aria-label={t(`common.languages.${lang}`)}
            title={t(`common.languages.${lang}`)}
            className="relative z-0 min-w-[2rem] rounded-lg px-2 py-1.5 text-[11px] font-semibold leading-none tracking-wide transition-colors sm:min-w-[2.25rem] sm:px-2.5 sm:text-xs"
          >
            {active && (
              <motion.span
                layoutId="admin-header-lang-pill"
                className="absolute inset-0 rounded-lg bg-[var(--admin-brand)] shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                aria-hidden
              />
            )}
            <span
              className={`relative z-[1] ${
                active
                  ? 'text-white'
                  : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]'
              }`}
            >
              {LABELS[lang]}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
};

export default AdminLanguageSwitcher;
