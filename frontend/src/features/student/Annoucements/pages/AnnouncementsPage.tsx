import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import AnnouncementsStatsGrid from '../components/AnnouncementsStatsGrid';
import RecommendedForYouSection from '../components/RecommendedForYouSection';
import AllAnnouncementsFeedSection from '../components/AllAnnouncementsFeedSection';
import AnnouncementsFilterBar from '../components/AnnouncementsFilterBar';
import StudentAnnouncementsFiltersSkeleton from '../components/StudentAnnouncementsFiltersSkeleton';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';
import { useStudentAnnouncements } from '../hooks/useStudentAnnouncements';
import type { AnnouncementDateFilter } from '../types';
import '../../../admin/announcements-stage/styles/admin-announcements.css';

const AnnouncementsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<AnnouncementDateFilter>('all');

  const { items, recommended, stats, typeOptions, loading, error } = useStudentAnnouncements({
    search,
    type: typeFilter,
    priority: priorityFilter,
    date: dateFilter,
  });

  const isInitialLoad = loading && items.length === 0 && recommended.length === 0;

  return (
    <StudentLayout>
      <div id="student-announcements-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <section aria-label={t('student.announcements.statsAria')} className="min-w-0">
          <AnnouncementsStatsGrid stats={stats} loading={isInitialLoad} />
        </section>

        {isInitialLoad ? (
          <StudentAnnouncementsFiltersSkeleton />
        ) : (
          <AnnouncementsFilterBar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            typeOptions={typeOptions}
            searchLoading={loading}
            totalCount={items.length}
          />
        )}

        {error ? (
          <p className="m-0 text-sm text-[var(--admin-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        {(isInitialLoad || recommended.length > 0) ? (
          <RecommendedForYouSection
            items={recommended}
            loading={isInitialLoad || (loading && recommended.length === 0)}
          />
        ) : null}

        {!isInitialLoad ? (
          <AllAnnouncementsFeedSection
            items={items}
            loading={loading && items.length === 0}
            showTitle={false}
          />
        ) : null}
      </div>
    </StudentLayout>
  );
};

export default AnnouncementsPage;
