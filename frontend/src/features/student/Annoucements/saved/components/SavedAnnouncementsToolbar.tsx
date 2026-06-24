import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Heart, List, SlidersHorizontal, X } from 'lucide-react';
import AdminSearchInput from '../../../../admin/ui/AdminSearchInput';
import type { SavedAnnouncementKindFilter } from '../types';

interface SavedAnnouncementsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  kindFilter: SavedAnnouncementKindFilter;
  onKindFilterChange: (value: SavedAnnouncementKindFilter) => void;
  totalCount: number;
  searchLoading?: boolean;
}

const KIND_FILTERS: SavedAnnouncementKindFilter[] = ['all', 'saved', 'favorited'];

const SavedAnnouncementsToolbar: FunctionComponent<SavedAnnouncementsToolbarProps> = ({
  search,
  onSearchChange,
  kindFilter,
  onKindFilterChange,
  totalCount,
  searchLoading = false,
}) => {
  const { t } = useTranslation();

  const hasActiveFilters = search.trim().length > 0 || kindFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onKindFilterChange('all');
  };

  return (
    <section
      className="admin-ann-feed student-ann-feed-panel"
      aria-label={t('student.announcements.savedFilters.toolbarAria')}
    >
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <span className="admin-ann-feed__icon-wrap" aria-hidden>
              <Heart className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
            </span>
            <div className="admin-ann-feed__titles">
              <div className="admin-ann-feed__title-row">
                <h2 className="admin-ann-feed__title">{t('student.announcements.savedTitle')}</h2>
                <span className="admin-ann-feed__count">{totalCount}</span>
              </div>
              <p className="admin-ann-feed__subtitle">{t('student.announcements.savedSubtitle')}</p>
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
            <span>{t('student.announcements.savedFilters.label')}</span>
          </div>

          <div
            className="student-ann-feed__date-toggles"
            role="group"
            aria-label={t('student.announcements.savedFilters.kindAria')}
          >
            {KIND_FILTERS.map((value) => {
              const Icon = value === 'saved' ? Bookmark : value === 'favorited' ? Heart : List;
              return (
                <button
                  key={value}
                  type="button"
                  className={`admin-ann-filters__toggle${kindFilter === value ? ' is-active' : ''}`}
                  aria-pressed={kindFilter === value}
                  onClick={() => onKindFilterChange(value)}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t(`student.announcements.savedFilters.${value}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavedAnnouncementsToolbar;
