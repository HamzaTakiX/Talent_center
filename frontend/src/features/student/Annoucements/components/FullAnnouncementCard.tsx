import { FunctionComponent } from 'react';
import { Building2, Calendar, Clock } from 'lucide-react';
import type { FullAnnouncementItem } from '../types';
import AnnouncementBadge from './AnnouncementBadge';
import MatchScoreBadge from './MatchScoreBadge';
import PriorityBadge from './PriorityBadge';
import AnnouncementActionMenu from './AnnouncementActionMenu';
import { announcementCategoryIconMap } from '../utils/announcementCategoryIcon';
import {
  LIST_CARD_SURFACE,
  RECOMMENDED_CARD_SURFACE,
} from '../constants/allAnnouncementsStyles';

interface FullAnnouncementCardProps {
  item: FullAnnouncementItem;
  variant: 'recommended' | 'list';
}

const FullAnnouncementCard: FunctionComponent<FullAnnouncementCardProps> = ({
  item,
  variant,
}) => {
  const CategoryIcon = announcementCategoryIconMap[item.tag];
  const surfaceClass = variant === 'recommended' ? RECOMMENDED_CARD_SURFACE : LIST_CARD_SURFACE;

  return (
    <article className={surfaceClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {item.matchScore != null ? <MatchScoreBadge score={item.matchScore} /> : null}
          <span className="inline-flex items-center gap-1">
            <CategoryIcon
              className="hidden size-3.5 shrink-0 text-current opacity-70 sm:inline"
              strokeWidth={2}
              aria-hidden
            />
            <AnnouncementBadge tag={item.tag} />
          </span>
          <PriorityBadge priority={item.priority} />
        </div>
        <AnnouncementActionMenu announcementId={item.id} />
      </div>

      <h3 className="m-0 text-base font-semibold leading-snug text-[var(--admin-text)] sm:text-[17px]">
        {item.title}
      </h3>

      <p className="m-0 inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm font-medium text-[#6b7280]">
        <Building2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="truncate">{item.company}</span>
      </p>

      <p className="m-0 text-sm leading-relaxed text-[#6b7280]">{item.description}</p>

      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--admin-text-muted)] sm:text-[13px]">
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{item.postedDate}</span>
        </span>
        <span
          className={`inline-flex min-w-0 items-center gap-1.5 ${
            item.deadlineUrgent ? 'font-semibold text-[#dc2626]' : ''
          }`}
        >
          <Clock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="break-words">{item.deadlineLabel}</span>
        </span>
      </div>
    </article>
  );
};

export default FullAnnouncementCard;
