import { FunctionComponent, useMemo, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import AnnouncementsFilterBar from '../components/AnnouncementsFilterBar';
import RecommendedForYouSection from '../components/RecommendedForYouSection';
import AllAnnouncementsFeedSection from '../components/AllAnnouncementsFeedSection';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';
import {
  allAnnouncementsFeed,
  recommendedAnnouncements,
} from '../data/allAnnouncementsMock';
import { filterAnnouncements } from '../utils/filterAnnouncements';

const AllAnnouncementsPage: FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRecommended = useMemo(
    () => filterAnnouncements(recommendedAnnouncements, search, typeFilter, priorityFilter),
    [search, typeFilter, priorityFilter]
  );

  const filteredAll = useMemo(
    () => filterAnnouncements(allAnnouncementsFeed, search, typeFilter, priorityFilter),
    [search, typeFilter, priorityFilter]
  );

  return (
    <StudentLayout headerTitle="Announcements" headerSubtitle="Digital Talent Center">
      <div id="student-announcements-all-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <AnnouncementsFilterBar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        <RecommendedForYouSection items={filteredRecommended} />

        <AllAnnouncementsFeedSection items={filteredAll} />
      </div>
    </StudentLayout>
  );
};

export default AllAnnouncementsPage;
