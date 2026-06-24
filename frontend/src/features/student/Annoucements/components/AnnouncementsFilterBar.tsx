import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import AdminSearchInput from '../../../admin/ui/AdminSearchInput';
import AdminSelectField from '../../../admin/ui/AdminSelectField';
import { adminFormLabelClass } from '../../../admin/shared/forms/adminFormClasses';
import {
  ANNOUNCEMENT_DATE_FILTER_VALUES,
  ANNOUNCEMENT_PRIORITY_FILTER_VALUES,
  type AnnouncementDateFilter,
} from '../types';

interface AnnouncementsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  dateFilter: AnnouncementDateFilter;
  onDateFilterChange: (value: AnnouncementDateFilter) => void;
  typeOptions: { code: string; name: string }[];
  searchLoading?: boolean;
  totalCount?: number;
}

const AnnouncementsFilterBar: FunctionComponent<AnnouncementsFilterBarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  typeOptions,
  searchLoading = false,
  totalCount,
}) => {
  const { t, i18n } = useTranslation();

  const resolvedTypeOptions = useMemo(
    () => [
      { value: 'all', label: t('student.announcements.filters.allTypes') },
      ...typeOptions.map((opt) => ({ value: opt.code, label: opt.name })),
    ],
    [t, i18n.language, typeOptions],
  );

  const priorityOptions = useMemo(
    () =>
      ANNOUNCEMENT_PRIORITY_FILTER_VALUES.map((value) => ({
        value,
        label:
          value === 'all'
            ? t('student.announcements.filters.allPriorities')
            : t(
                `student.announcements.priority.${value === 'Urgent' ? 'urgent' : value === 'Important' ? 'important' : 'normal'}`,
              ),
      })),
    [t, i18n.language],
  );

  const dateOptions = useMemo(
    () =>
      ANNOUNCEMENT_DATE_FILTER_VALUES.map((value) => ({
        value,
        label: t(`student.announcements.filters.date.${value}`),
      })),
    [t, i18n.language],
  );

  const hasActiveFilters =
    search.trim().length > 0 ||
    typeFilter !== 'all' ||
    priorityFilter !== 'all' ||
    dateFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onTypeFilterChange('all');
    onPriorityFilterChange('all');
    onDateFilterChange('all');
  };

  return (
    <section className="admin-ann-feed student-ann-feed-panel" aria-label={t('student.announcements.filterToolbarAria')}>
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <span className="admin-ann-feed__icon-wrap" aria-hidden>
              <SlidersHorizontal className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
            </span>
            <div className="admin-ann-feed__titles">
              <div className="admin-ann-feed__title-row">
                <h2 className="admin-ann-feed__title">{t('student.announcements.allTitle')}</h2>
                {typeof totalCount === 'number' ? (
                  <span className="admin-ann-feed__count">{totalCount}</span>
                ) : null}
              </div>
              <p className="admin-ann-feed__subtitle">{t('student.announcements.filters.subtitle')}</p>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="admin-ann-feed__hero-actions">
              <button type="button" className="admin-ann-feed__clear" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" aria-hidden />
                {t('student.announcements.filters.clear')}
              </button>
            </div>
          ) : null}
        </div>

        <div className="admin-ann-feed__toolbar">
          <AdminSearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder={t('student.announcements.searchPlaceholder')}
            aria-label={t('student.announcements.searchAria')}
            loading={searchLoading}
          />
        </div>

        <div className="admin-ann-feed__filters-zone">
          <div className="admin-ann-feed__filters-head">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--admin-brand)]" aria-hidden />
            <span>{t('student.announcements.filters.label')}</span>
          </div>

          <div className="admin-ann-feed__filters">
            <div className="student-ann-feed__filter-field">
              <span className={adminFormLabelClass}>{t('student.announcements.filterType')}</span>
              <AdminSelectField
                value={typeFilter}
                onChange={onTypeFilterChange}
                options={resolvedTypeOptions}
                aria-label={t('student.announcements.filterTypeAria')}
                searchable
              />
            </div>
            <div className="student-ann-feed__filter-field">
              <span className={adminFormLabelClass}>{t('student.announcements.filterPriority')}</span>
              <AdminSelectField
                value={priorityFilter}
                onChange={onPriorityFilterChange}
                options={priorityOptions}
                aria-label={t('student.announcements.filterPriorityAria')}
              />
            </div>
          </div>

          <div
            className="student-ann-feed__date-toggles"
            role="group"
            aria-label={t('student.announcements.filterDateAria')}
          >
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`admin-ann-filters__toggle${dateFilter === opt.value ? ' is-active' : ''}`}
                aria-pressed={dateFilter === opt.value}
                onClick={() => onDateFilterChange(opt.value as AnnouncementDateFilter)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsFilterBar;
