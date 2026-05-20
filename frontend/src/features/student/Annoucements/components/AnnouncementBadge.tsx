import { FunctionComponent } from 'react';
import type { AnnouncementTag } from '../types';
import { announcementTagClassMap } from '../data/announcementsMock';
import { ANNOUNCEMENT_TAG_BADGE_BASE } from '../constants/announcementsStyles';

interface AnnouncementBadgeProps {
  tag: AnnouncementTag;
  /** Active un léger hover/focus (badge cliquable). */
  interactive?: boolean;
  onClick?: () => void;
}

const AnnouncementBadge: FunctionComponent<AnnouncementBadgeProps> = ({
  tag,
  interactive = false,
  onClick,
}) => {
  const className = `${ANNOUNCEMENT_TAG_BADGE_BASE} ${announcementTagClassMap[tag]} ${
    interactive ? 'cursor-pointer active:translate-y-0 active:shadow-none' : 'cursor-default'
  }`;

  const label = `${tag} announcement category`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={label}
      >
        <span className="truncate">{tag}</span>
      </button>
    );
  }

  return (
    <span className={className} aria-label={label}>
      <span className="truncate">{tag}</span>
    </span>
  );
};

export default AnnouncementBadge;
