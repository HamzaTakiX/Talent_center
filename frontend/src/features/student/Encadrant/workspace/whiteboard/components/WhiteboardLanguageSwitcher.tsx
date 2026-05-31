import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { readStoredAppLanguage } from '../../../../../../i18n/appLanguage';
import { APP_LANGUAGES, type AppLanguage } from '../../../../../../i18n/types';

const LABELS: Record<AppLanguage, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'ع',
};

interface WhiteboardLanguageSwitcherProps {
  onSelect: (lang: AppLanguage) => void;
}

const WhiteboardLanguageSwitcher: FunctionComponent<WhiteboardLanguageSwitcherProps> = ({
  onSelect,
}) => {
  const { i18n, t } = useTranslation();
  const current = (
    APP_LANGUAGES.includes(i18n.language as AppLanguage)
      ? i18n.language
      : readStoredAppLanguage()
  ) as AppLanguage;

  return (
    <div
      role="group"
      aria-label={t('student.encadrant.workspace.whiteboardPage.settings.language.title')}
      className="student-whiteboard-lang-switch"
    >
      {APP_LANGUAGES.map((lang) => {
        const active = current === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onSelect(lang)}
            aria-pressed={active}
            aria-label={t(`common.languages.${lang}`)}
            title={t(`common.languages.${lang}`)}
            className="student-whiteboard-lang-switch__btn"
          >
            {active && (
              <motion.span
                layoutId="whiteboard-header-lang-pill"
                className="student-whiteboard-lang-switch__pill"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                aria-hidden
              />
            )}
            <span
              className={`student-whiteboard-lang-switch__label ${
                active ? 'is-active' : ''
              }`}
            >
              {LABELS[lang]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WhiteboardLanguageSwitcher;
