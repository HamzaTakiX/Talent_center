import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Search } from 'lucide-react';
import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';
import { internshipOfferCategoryOptions } from '../constants/internshipOfferCategories';
import {
  PLATFORM_SEARCH_FIELD,
  PLATFORM_SEARCH_ICON,
  PLATFORM_SEARCH_WRAP,
} from '../../../../design-system/platformTokens';

interface InternshipOffersSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: InternshipOfferCategoryFilter;
  onCategoryChange: (value: InternshipOfferCategoryFilter) => void;
}

const InternshipOffersSearchToolbar: FunctionComponent<InternshipOffersSearchToolbarProps> = ({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex w-full min-w-0 max-w-full flex-col gap-3 max-[429px]:gap-2.5 sm:flex-row sm:items-stretch sm:gap-4"
      role="search"
    >
      <div className={`${PLATFORM_SEARCH_WRAP} min-h-10 flex-1 sm:min-w-[12rem]`}>
        <Search className={PLATFORM_SEARCH_ICON} strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('student.internshipOffers.searchPlaceholder')}
          className={PLATFORM_SEARCH_FIELD}
        />
      </div>

      <div className="relative w-full max-w-full min-w-0 shrink-0 sm:w-auto sm:min-w-[11.5rem]">
        <Filter
          className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
          strokeWidth={1.75}
          aria-hidden
        />
        <select
          aria-label={t('student.internshipOffers.filterCategoryAria')}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as InternshipOfferCategoryFilter)}
          className="admin-form-input admin-field h-10 w-full min-w-0 cursor-pointer appearance-none py-2 pl-3 pr-10 text-sm font-medium"
        >
          {internshipOfferCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InternshipOffersSearchToolbar;
