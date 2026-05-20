import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { persistAppLanguage, readStoredAppLanguage } from '../../../i18n/appLanguage';
import { APP_LANGUAGES, type AppLanguage } from '../../../i18n/types';

const LABELS: Record<AppLanguage, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'ع',
};

const BTN_BASE =
  'auth-lang-btn cursor-pointer rounded-md border-0 shadow-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--auth-brand)]/35';

interface AuthLanguageSwitcherProps {
  embedded?: boolean;
  className?: string;
}

const AuthLanguageSwitcher: FunctionComponent<AuthLanguageSwitcherProps> = ({
  embedded = false,
  className = '',
}) => {
  const { i18n, t } = useTranslation();
  const current = (
    ['fr', 'en', 'ar'].includes(i18n.language) ? i18n.language : readStoredAppLanguage()
  ) as AppLanguage;

  const select = (lang: AppLanguage) => {
    if (lang === current) return;
    void persistAppLanguage(lang);
  };

  const positionClass = embedded ? '' : 'absolute end-4 top-4 z-20 sm:end-6 sm:top-6';

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`auth-lang-switch ${embedded ? 'inline-flex items-center gap-0.5' : 'inline-flex items-center gap-0.5'} ${positionClass} ${className}`.trim()}
    >
      {APP_LANGUAGES.map((lang) => {
        const isActive = current === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => select(lang)}
            aria-pressed={isActive}
            aria-label={t(`common.languages.${lang}`)}
            title={t(`common.languages.${lang}`)}
            className={`${BTN_BASE} ${isActive ? 'auth-lang-btn--active' : ''}`}
          >
            <span className="auth-lang-btn__label" aria-hidden>
              {LABELS[lang]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AuthLanguageSwitcher;
