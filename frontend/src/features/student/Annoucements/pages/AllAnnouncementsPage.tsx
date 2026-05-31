import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import RecommendedForYouSection from '../components/RecommendedForYouSection';
import AllAnnouncementsFeedSection from '../components/AllAnnouncementsFeedSection';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';
import {
  allAnnouncementsFeed,
  recommendedAnnouncements,
} from '../data/allAnnouncementsMock';
import { filterAnnouncements } from '../utils/filterAnnouncements';
import { resolveAnnouncementItem } from '../utils/resolveAnnouncementItem';

const AllAnnouncementsPage: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const resolvedRecommended = useMemo(
    () => recommendedAnnouncements.map((item) => resolveAnnouncementItem(item, t)),
    [t, i18n.language],
  );

  const resolvedAll = useMemo(
    () => allAnnouncementsFeed.map((item) => resolveAnnouncementItem(item, t)),
    [t, i18n.language],
  );

  /** Recherche / filtres : section « Toutes les annonces » uniquement. */
  const filteredAll = useMemo(
    () => filterAnnouncements(resolvedAll, search, typeFilter, priorityFilter, t),
    [resolvedAll, search, typeFilter, priorityFilter, t],
  );

  return (
    <StudentLayout>
      <div id="student-announcements-all-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <RecommendedForYouSection items={resolvedRecommended} />

        <AllAnnouncementsFeedSection
          items={filteredAll}
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />
      </div>
    </StudentLayout>
  );
};

export default AllAnnouncementsPage;
