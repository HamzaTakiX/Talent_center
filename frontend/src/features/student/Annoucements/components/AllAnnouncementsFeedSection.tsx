import { FunctionComponent } from 'react';
import type { FullAnnouncementItem } from '../types';
import FullAnnouncementCard from './FullAnnouncementCard';

interface AllAnnouncementsFeedSectionProps {
  items: FullAnnouncementItem[];
}

const AllAnnouncementsFeedSection: FunctionComponent<AllAnnouncementsFeedSectionProps> = ({
  items,
}) => {
  return (
    <section aria-label="All Announcements" className="flex w-full min-w-0 flex-col gap-4">
      <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
        All Announcements
      </h2>

      {items.length === 0 ? (
        <p className="m-0 rounded-[14px] border border-dashed border-[#e5e7eb] bg-[var(--admin-surface-muted)] px-4 py-8 text-center text-sm font-medium text-[#6b7280]">
          No announcements match your filters.
        </p>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-3.5">
          {items.map((item) => (
            <FullAnnouncementCard key={item.id} item={item} variant="list" />
          ))}
        </div>
      )}
    </section>
  );
};

export default AllAnnouncementsFeedSection;
