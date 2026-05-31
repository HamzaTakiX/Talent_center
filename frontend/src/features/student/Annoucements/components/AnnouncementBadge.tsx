import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnnouncementTag } from '../types';
import { announcementTagClassMap } from '../data/announcementsMock';
import { ANNOUNCEMENT_TAG_BADGE_BASE } from '../constants/announcementsStyles';
import { announcementTagLabel } from '../utils/resolveAnnouncementItem';
import { announcementCategoryIconMap } from '../utils/announcementCategoryIcon';

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
  const { t } = useTranslation();
  const CategoryIcon = announcementCategoryIconMap[tag];
  const className = `${ANNOUNCEMENT_TAG_BADGE_BASE} ${announcementTagClassMap[tag]} gap-1 ${
    interactive ? 'cursor-pointer active:translate-y-0 active:shadow-none' : 'cursor-default'
  }`;
  const label = announcementTagLabel(tag, t);
  const aria = t('student.announcements.mocks.tagAria', { tag: label });
  const icon = (
    <CategoryIcon className="size-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
  );
  const labelNode = <span className="truncate">{label}</span>;

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={aria}>
        {icon}
        {labelNode}
      </button>
    );
  }

  return (
    <span className={className} aria-label={aria}>
      {icon}
      {labelNode}
    </span>
  );
};

export default AnnouncementBadge;
