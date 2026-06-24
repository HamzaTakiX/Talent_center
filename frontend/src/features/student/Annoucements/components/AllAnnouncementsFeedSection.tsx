import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminPagination from '../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../admin/shared/hooks/useAdminPagination';
import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';
import type { FullAnnouncementItem } from '../types';
import { ANNOUNCEMENTS_FEED_PAGE_SIZE } from '../constants/announcementsLayout';
import FullAnnouncementCard from './FullAnnouncementCard';
import StudentAnnouncementsFeedSkeleton from './StudentAnnouncementsFeedSkeleton';

interface AllAnnouncementsFeedSectionProps {
  items: FullAnnouncementItem[];
  loading?: boolean;
  showTitle?: boolean;
  titleKey?: string;
  emptyTitleKey?: string;
  onBookmarkChange?: (announcementId: string, state: { isSaved: boolean; isFavorited: boolean }) => void;
}

const AllAnnouncementsFeedSection: FunctionComponent<AllAnnouncementsFeedSectionProps> = ({
  items,
  loading = false,
  showTitle = true,
  titleKey = 'student.announcements.allTitle',
  emptyTitleKey = 'student.announcements.noResults',
  onBookmarkChange,
}) => {
  const { t } = useTranslation();
  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } = useAdminPagination(
    items,
    ANNOUNCEMENTS_FEED_PAGE_SIZE,
  );

  return (
    <section
      aria-label={t(titleKey)}
      className="flex w-full min-w-0 flex-col gap-3 sm:gap-3.5"
    >
      {showTitle ? (
        <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
          {t(titleKey)}
        </h2>
      ) : null}

      {loading ? (
        <StudentAnnouncementsFeedSkeleton count={ANNOUNCEMENTS_FEED_PAGE_SIZE} variant="list" />
      ) : items.length === 0 ? (
        <div className="w-full min-w-0 max-w-full">
          <StudentSearchEmptyState
            title={t(emptyTitleKey)}
            className="w-full min-w-0 max-w-full"
          />
        </div>
      ) : (
        <>
          <div className="student-announcement-card-stack w-full min-w-0">
            {paginatedItems.map((item) => (
              <FullAnnouncementCard
                key={item.id}
                item={item}
                variant="list"
                onBookmarkChange={
                  onBookmarkChange
                    ? (state) => onBookmarkChange(item.id, state)
                    : undefined
                }
              />
            ))}
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('student.announcements.pagination.announcements')}
          />
        </>
      )}
    </section>
  );
};

export default AllAnnouncementsFeedSection;
