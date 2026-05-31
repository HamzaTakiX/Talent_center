import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { FullAnnouncementItem } from '../types';
import FullAnnouncementCard from './FullAnnouncementCard';
import AnnouncementsFilterBar from './AnnouncementsFilterBar';
import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';

interface AllAnnouncementsFeedSectionProps {
  items: FullAnnouncementItem[];
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

const AllAnnouncementsFeedSection: FunctionComponent<AllAnnouncementsFeedSectionProps> = ({
  items,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t('student.announcements.allTitle')}
      className="flex w-full min-w-0 flex-col gap-3 sm:gap-3.5"
    >
      <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
        {t('student.announcements.allTitle')}
      </h2>

      <AnnouncementsFilterBar
        search={search}
        onSearchChange={onSearchChange}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={onPriorityFilterChange}
      />

      {items.length === 0 ? (
        <div className="w-full min-w-0 max-w-full">
          <StudentSearchEmptyState
            title={t('student.announcements.noResults')}
            className="w-full min-w-0 max-w-full"
          />
        </div>
      ) : (
        <div className="student-announcement-card-stack flex w-full min-w-0 flex-col gap-3 sm:gap-3.5">
          {items.map((item) => (
            <FullAnnouncementCard key={item.id} item={item} variant="list" />
          ))}
        </div>
      )}
    </section>
  );
};

export default AllAnnouncementsFeedSection;
