import { FunctionComponent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar } from 'lucide-react';
import type { StudentAnnouncementItem } from '../types';
import { ANNOUNCEMENT_SURFACE_CARD } from '../constants/announcementsStyles';
import { getStudentAnnouncementDetailPath } from '../constants/routes';
import AnnouncementBadge from './AnnouncementBadge';

interface AnnouncementCardProps {
  item: StudentAnnouncementItem;
}

const AnnouncementCard: FunctionComponent<AnnouncementCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleOpenDetail = useCallback(() => {
    navigate(getStudentAnnouncementDetailPath(item.id));
  }, [item.id, navigate]);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      className={`${ANNOUNCEMENT_SURFACE_CARD} student-announcement-card--clickable gap-3 p-4 sm:p-5`}
    >      {item.coverImageUrl ? (
        <img
          src={item.coverImageUrl}
          alt=""
          className="student-announcement-card__cover-image h-28 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}
      <AnnouncementBadge
        typeCode={item.typeCode}
        typeName={item.typeName}
        iconKey={item.typeIcon}
      />
      <h3 className="m-0 text-base font-semibold leading-[1.4] text-[var(--admin-text)] sm:text-[17px]">
        {item.title}
      </h3>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium leading-5 text-[var(--admin-text-muted)] sm:text-sm">
        {item.company && item.company !== '—' ? (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
            <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="truncate">{item.company}</span>
          </span>
        ) : null}
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap">{item.date}</span>
        </span>
      </div>
    </article>
  );
};

export default AnnouncementCard;
