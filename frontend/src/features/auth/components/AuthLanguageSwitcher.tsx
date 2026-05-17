import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { persistAppLanguage, readStoredAppLanguage } from '../../../i18n/appLanguage';
import { APP_LANGUAGES, type AppLanguage } from '../../../i18n/types';

const LABELS: Record<AppLanguage, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'ع',
};

const PILL_CLASS =
  'flex items-center gap-1 rounded-xl border border-gainsboro bg-white/95 p-1 shadow-sm backdrop-blur-sm';

interface AuthLanguageSwitcherProps {
  /** Sans position absolue — à placer dans la colonne formulaire (login). */
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
      className={`${PILL_CLASS} ${positionClass} ${className}`.trim()}
    >
      {APP_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => select(lang)}
          aria-pressed={current === lang}
          aria-label={t(`common.languages.${lang}`)}
          title={t(`common.languages.${lang}`)}
          className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            current === lang
              ? 'bg-mediumslateblue text-white shadow-sm'
              : 'text-dimgray hover:bg-slate-50'
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
};

export default AuthLanguageSwitcher;
