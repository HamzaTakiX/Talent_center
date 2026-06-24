import { FunctionComponent, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import RecommendedForYouSection from '../components/RecommendedForYouSection';
import AllAnnouncementsFeedSection from '../components/AllAnnouncementsFeedSection';
import AnnouncementsFilterBar from '../components/AnnouncementsFilterBar';
import StudentAnnouncementsFiltersSkeleton from '../components/StudentAnnouncementsFiltersSkeleton';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';
import { useStudentAnnouncements } from '../hooks/useStudentAnnouncements';
import type { AnnouncementDateFilter } from '../types';
import '../../../admin/announcements-stage/styles/admin-announcements.css';

const AllAnnouncementsPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<AnnouncementDateFilter>('all');

  const { items, recommended, typeOptions, loading, error } = useStudentAnnouncements({
    search,
    type: typeFilter,
    priority: priorityFilter,
    date: dateFilter,
  });

  const isInitialLoad = loading && items.length === 0 && recommended.length === 0;

  return (
    <StudentLayout>
      <div id="student-announcements-all-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        {error ? (
          <p className="m-0 text-sm text-[var(--admin-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <RecommendedForYouSection items={recommended} loading={isInitialLoad || (loading && recommended.length === 0)} />

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

        <AllAnnouncementsFeedSection
          items={items}
          loading={isInitialLoad || (loading && items.length === 0)}
        />
      </div>
    </StudentLayout>
  );
};

export default AllAnnouncementsPage;
