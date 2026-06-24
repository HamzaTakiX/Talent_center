import { FunctionComponent } from 'react';
import { typeIcon } from '../../../admin/announcements-stage/utils/announcementMeta';
import { ANNOUNCEMENT_TAG_BADGE_BASE } from '../constants/announcementsStyles';

interface AnnouncementBadgeProps {
  typeCode: string;
  typeName: string;
  iconKey?: string;
  typeColor?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const AnnouncementBadge: FunctionComponent<AnnouncementBadgeProps> = ({
  typeCode,
  typeName,
  iconKey,
  typeColor,
  interactive = false,
  onClick,
}) => {
  const CategoryIcon = typeIcon({ code: typeCode, icon: iconKey });
  const className = `${ANNOUNCEMENT_TAG_BADGE_BASE} admin-badge admin-badge--info gap-1 ${
    interactive ? 'cursor-pointer active:translate-y-0 active:shadow-none' : 'cursor-default'
  }`;
  const style = typeColor
    ? {
        backgroundColor: `color-mix(in srgb, ${typeColor} 14%, var(--admin-bg-elevated))`,
        color: typeColor,
        borderColor: `color-mix(in srgb, ${typeColor} 28%, var(--admin-border))`,
      }
    : undefined;
  const icon = (
    <CategoryIcon className="size-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
  );
  const labelNode = <span className="truncate">{typeName}</span>;

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={className} style={style} aria-label={typeName}>
        {icon}
        {labelNode}
      </button>
    );
  }

  return (
    <span className={className} style={style} aria-label={typeName}>
      {icon}
      {labelNode}
    </span>
  );
};

export default AnnouncementBadge;
