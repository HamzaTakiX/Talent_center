import { FunctionComponent } from 'react';
import { Check } from 'lucide-react';
import type { AppLanguage } from '../../../../i18n/types';
import { APP_LANGUAGES } from '../../../../i18n/types';

export interface LanguageOption {
  value: AppLanguage;
  primary: string;
  secondary: string;
  flagSrc: string;
  flagAlt: string;
}

const LANGUAGE_META: Record<AppLanguage, Omit<LanguageOption, 'value'>> = {
  fr: {
    primary: 'Français',
    secondary: 'French',
    flagSrc: 'https://flagcdn.com/w80/fr.png',
    flagAlt: 'Drapeau de la France',
  },
  en: {
    primary: 'English',
    secondary: 'English',
    flagSrc: 'https://flagcdn.com/w80/us.png',
    flagAlt: 'United States flag',
  },
  ar: {
    primary: 'العربية',
    secondary: 'Arabic',
    flagSrc: 'https://flagcdn.com/w80/ma.png',
    flagAlt: 'Drapeau du Maroc',
  },
};

export const getLanguageOptions = (): LanguageOption[] =>
  APP_LANGUAGES.map((value) => ({ value, ...LANGUAGE_META[value] }));

interface LanguageSelectProps {
  id?: string;
  value: AppLanguage;
  onChange: (value: AppLanguage) => void;
}

const LanguageSelect: FunctionComponent<LanguageSelectProps> = ({
  id = 'language',
  value,
  onChange,
}) => {
  const options = getLanguageOptions();

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className="admin-language-picker mr-auto flex w-full max-w-sm flex-col gap-2"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            id={`${id}-${opt.value}`}
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`admin-language-card flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
              isSelected ? 'admin-language-card--active' : 'admin-language-card--idle'
            }`}
          >
            <span className="admin-language-card-flag relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-black/8">
              <img
                src={opt.flagSrc}
                alt={opt.flagAlt}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </span>

            <span
              className={`min-w-0 flex-1 truncate text-[13px] font-medium leading-tight ${
                isSelected ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text)]'
              }`}
            >
              {opt.primary}
              <span className="text-[var(--admin-text-muted)]"> / </span>
              <span className={isSelected ? 'text-[var(--admin-brand)]/75' : 'text-[var(--admin-text-secondary)]'}>
                {opt.secondary}
              </span>
            </span>

            <span
              className={`admin-language-card-radio flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all ${
                isSelected ? 'admin-language-card-radio--active' : 'admin-language-card-radio--idle'
              }`}
              aria-hidden
            >
              {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelect;
