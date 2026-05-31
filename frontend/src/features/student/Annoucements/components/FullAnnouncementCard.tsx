import { FunctionComponent } from 'react';
import { Building2, Calendar, Clock } from 'lucide-react';
import type { FullAnnouncementItem } from '../types';
import AnnouncementBadge from './AnnouncementBadge';
import MatchScoreBadge from './MatchScoreBadge';
import PriorityBadge from './PriorityBadge';
import AnnouncementActionMenu from './AnnouncementActionMenu';
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
  const surfaceClass = variant === 'recommended' ? RECOMMENDED_CARD_SURFACE : LIST_CARD_SURFACE;

  return (
    <article className={`student-announcement-card ${surfaceClass}`}>
      <div className="student-announcement-card__header">
        <div className="student-announcement-card__badges">
          {item.matchScore != null ? <MatchScoreBadge score={item.matchScore} /> : null}
          <AnnouncementBadge tag={item.tag} />
          <PriorityBadge priority={item.priority} />
        </div>
        <div className="student-announcement-card__menu">
          <AnnouncementActionMenu announcementId={item.id} />
        </div>
      </div>

      <h3 className="student-announcement-card__title" dir="auto">
        {item.title}
      </h3>

      <p className="student-announcement-card__company" dir="auto">
        <Building2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 truncate">{item.company}</span>
      </p>

      <p className="student-announcement-card__description" dir="auto">
        {item.description}
      </p>

      <div className="student-announcement-card__footer">
        <span className="student-announcement-card__meta-line" dir="auto">
          <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{item.postedDate}</span>
        </span>
        <span
          className={`student-announcement-card__meta-line ${
            item.deadlineUrgent ? 'student-announcement-card__meta-line--urgent' : ''
          }`}
          dir="auto"
        >
          <Clock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>{item.deadlineLabel}</span>
        </span>
      </div>
    </article>
  );
};

export default FullAnnouncementCard;
