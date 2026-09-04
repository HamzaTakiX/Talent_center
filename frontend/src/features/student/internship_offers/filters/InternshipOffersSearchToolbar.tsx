import { FunctionComponent, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, SlidersHorizontal, X } from 'lucide-react';
import AdminSearchInput from '../../../admin/ui/AdminSearchInput';
import { adminFormLabelClass } from '../../../admin/shared/forms/adminFormClasses';
import {
  DEFAULT_MAX_DISTANCE_KM,
  INTERNSHIP_OFFER_DATE_FILTER_VALUES,
  INTERNSHIP_OFFER_DISTANCE_SORT_VALUES,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
  type InternshipOfferDateFilter,
  type InternshipOfferDistanceSort,
} from '../constants/internshipOfferFilters';
import { OFFER_FIELD_LIMITS } from '../../../../design-system/safeContent';

interface InternshipOffersSearchToolbarProps {
  id?: string;
  query: string;
  onQueryChange: (value: string) => void;
  dateFilter: InternshipOfferDateFilter;
  onDateFilterChange: (value: InternshipOfferDateFilter) => void;
  maxDistanceKm: number;
  onMaxDistanceKmChange: (value: number) => void;
  distanceSort: InternshipOfferDistanceSort;
  onDistanceSortChange: (value: InternshipOfferDistanceSort) => void;
  searchLoading?: boolean;
  totalCount?: number;
  children?: ReactNode;
}

const InternshipOffersSearchToolbar: FunctionComponent<InternshipOffersSearchToolbarProps> = ({
  id,
  query,
  onQueryChange,
  dateFilter,
  onDateFilterChange,
  maxDistanceKm,
  onMaxDistanceKmChange,
  distanceSort,
  onDistanceSortChange,
  searchLoading = false,
  totalCount,
  children,
}) => {
  const { t, i18n } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dateOptions = useMemo(
    () =>
      INTERNSHIP_OFFER_DATE_FILTER_VALUES.map((value) => ({
        value,
        label: t(`student.internshipOffers.filters.date.${value}`),
      })),
    [t, i18n.language],
  );

  const distanceSortOptions = useMemo(
    () =>
      INTERNSHIP_OFFER_DISTANCE_SORT_VALUES.map((value) => ({
        value,
        label: t(`student.internshipOffers.filters.distanceSort.${value}`),
      })),
    [t, i18n.language],
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    dateFilter !== 'all' ||
    maxDistanceKm < DEFAULT_MAX_DISTANCE_KM ||
    distanceSort !== 'none';

  const clearFilters = () => {
    onQueryChange('');
    onDateFilterChange('all');
    onMaxDistanceKmChange(DEFAULT_MAX_DISTANCE_KM);
    onDistanceSortChange('none');
  };

  const handleSearchChange = (value: string) => {
    onQueryChange(value.slice(0, OFFER_FIELD_LIMITS.searchQuery));
  };

  const rangeLabel =
    maxDistanceKm >= MAX_DISTANCE_KM
      ? t('student.internshipOffers.filters.distanceUnlimited')
      : t('student.internshipOffers.filters.distanceValue', { km: maxDistanceKm });

  const filtersActive =
    filtersOpen ||
    dateFilter !== 'all' ||
    maxDistanceKm < DEFAULT_MAX_DISTANCE_KM ||
    distanceSort !== 'none';

  return (
    <section
      id={id}
      className="admin-ann-feed student-internship-feed-panel"
      aria-label={t('student.internshipOffers.allFeedAria')}
    >
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <span className="admin-ann-feed__icon-wrap" aria-hidden>
              <Briefcase className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
            </span>
            <div className="admin-ann-feed__titles">
              <div className="admin-ann-feed__title-row">
                <h2 className="admin-ann-feed__title">{t('student.internshipOffers.allTitle')}</h2>
                {typeof totalCount === 'number' ? (
                  <span className="admin-ann-feed__count">{totalCount}</span>
                ) : null}
              </div>
              <p className="admin-ann-feed__subtitle">{t('student.internshipOffers.allSubtitle')}</p>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="admin-ann-feed__hero-actions">
              <button type="button" className="admin-ann-feed__clear" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" aria-hidden />
                {t('student.internshipOffers.filters.clear')}
              </button>
            </div>
          ) : null}
        </div>

        <div className="admin-ann-feed__toolbar student-internship-feed__search-row">
          <button
            type="button"
            className={`student-internship-feed__filter-btn${filtersActive ? ' is-active' : ''}`}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="student-internship-offers-filters"
            aria-label={t('student.internshipOffers.filters.label')}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
          </button>

          <div className="student-internship-feed__search-cell">
            <AdminSearchInput
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={() => onQueryChange('')}
              placeholder={t('student.internshipOffers.searchPlaceholder')}
              aria-label={t('student.internshipOffers.searchAria')}
              loading={searchLoading}
            />
          </div>
        </div>

        {filtersOpen ? (
          <div
            id="student-internship-offers-filters"
            className="admin-ann-feed__filters-zone student-internship-feed__filters-zone"
          >
            <div className="student-internship-feed__filter-field">
              <span className={adminFormLabelClass}>{t('student.internshipOffers.filters.dateLabel')}</span>
              <div
                className="student-internship-feed__date-toggles"
                role="group"
                aria-label={t('student.internshipOffers.filterDateAria')}
              >
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`admin-ann-filters__toggle${dateFilter === opt.value ? ' is-active' : ''}`}
                    aria-pressed={dateFilter === opt.value}
                    onClick={() => onDateFilterChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="student-internship-feed__filter-field">
              <div className="student-internship-feed__range-header">
                <span className={adminFormLabelClass}>{t('student.internshipOffers.filters.distanceLabel')}</span>
                <span className="student-internship-feed__range-value">{rangeLabel}</span>
              </div>
              <input
                type="range"
                className="student-internship-feed__range-input"
                min={MIN_DISTANCE_KM}
                max={MAX_DISTANCE_KM}
                step={5}
                value={maxDistanceKm}
                onChange={(e) => onMaxDistanceKmChange(Number(e.target.value))}
                aria-label={t('student.internshipOffers.filters.distanceAria')}
                aria-valuemin={MIN_DISTANCE_KM}
                aria-valuemax={MAX_DISTANCE_KM}
                aria-valuenow={maxDistanceKm}
                aria-valuetext={rangeLabel}
              />
            </div>

            <div className="student-internship-feed__filter-field">
              <span className={adminFormLabelClass}>{t('student.internshipOffers.filters.distanceSortLabel')}</span>
              <div
                className="student-internship-feed__date-toggles"
                role="group"
                aria-label={t('student.internshipOffers.filters.distanceSortAria')}
              >
                {distanceSortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`admin-ann-filters__toggle${distanceSort === opt.value ? ' is-active' : ''}`}
                    aria-pressed={distanceSort === opt.value}
                    onClick={() => onDistanceSortChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {children ? (
        <div className="student-internship-feed__body">{children}</div>
      ) : null}
    </section>
  );
};

export default InternshipOffersSearchToolbar;
