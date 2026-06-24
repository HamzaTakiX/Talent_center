import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../../components/StudentLayout';
import AllAnnouncementsFeedSection from '../../components/AllAnnouncementsFeedSection';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../../constants/announcementsLayout';
import { useStudentSavedAnnouncements } from '../../hooks/useStudentSavedAnnouncements';
import SavedAnnouncementsStatsStrip from '../components/SavedAnnouncementsStatsStrip';
import SavedAnnouncementsToolbar from '../components/SavedAnnouncementsToolbar';
import SavedAnnouncementsToolbarSkeleton from '../components/SavedAnnouncementsToolbarSkeleton';
import type { SavedAnnouncementKindFilter } from '../types';
import '../../../../admin/announcements-stage/styles/admin-announcements.css';

const SavedAnnouncementsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<SavedAnnouncementKindFilter>('all');
  const { items, total, loading, error, removeItemIfUnmarked } = useStudentSavedAnnouncements(search);

  const isInitialLoad = loading && items.length === 0;

  const filteredItems = useMemo(() => {
    if (kindFilter === 'saved') return items.filter((item) => item.isSaved);
    if (kindFilter === 'favorited') return items.filter((item) => item.isFavorited);
    return items;
  }, [items, kindFilter]);

  const emptyTitleKey =
    kindFilter !== 'all' && items.length > 0
      ? 'student.announcements.savedFilters.emptyFiltered'
      : 'student.announcements.savedEmpty';

  const handleBookmarkChange = useCallback(
    (announcementId: string, state: { isSaved: boolean; isFavorited: boolean }) => {
      removeItemIfUnmarked(announcementId, state);
    },
    [removeItemIfUnmarked],
  );

  return (
    <StudentLayout>
      <div id="student-announcements-saved-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <section aria-label={t('student.announcements.savedPageStats.aria')} className="min-w-0">
          <SavedAnnouncementsStatsStrip items={items} loading={isInitialLoad} />
        </section>

        {isInitialLoad ? (
          <SavedAnnouncementsToolbarSkeleton />
        ) : (
          <SavedAnnouncementsToolbar
            search={search}
            onSearchChange={setSearch}
            kindFilter={kindFilter}
            onKindFilterChange={setKindFilter}
            totalCount={total}
            searchLoading={loading}
          />
        )}

        {error ? (
          <p className="m-0 text-sm text-[var(--admin-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        {!isInitialLoad ? (
          <AllAnnouncementsFeedSection
            items={filteredItems}
            loading={loading && items.length === 0}
            showTitle={false}
            emptyTitleKey={emptyTitleKey}
            onBookmarkChange={handleBookmarkChange}
          />
        ) : null}
      </div>
    </StudentLayout>
  );
};

export default SavedAnnouncementsPage;
