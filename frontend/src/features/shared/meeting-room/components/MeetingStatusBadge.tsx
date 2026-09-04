import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDashed } from 'lucide-react';
import type { MeetingStatus } from '../../../admin/encadrant/meetings/types/supervisionMeeting';
import { meetingStatusMeta } from '../../../admin/encadrant/meetings/utils/meetingStatusMeta';
import '../../../admin/encadrant/meetings/styles/admin-meetings.css';
import { normalizeMeetingStatus } from '../utils/meetingDisplayUtils';

interface MeetingStatusBadgeProps {
  status?: string | null;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const MeetingStatusBadge: FunctionComponent<MeetingStatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation();
  const normalized = normalizeMeetingStatus(status);
  const meta = normalized ? meetingStatusMeta[normalized as MeetingStatus] : undefined;
  const Icon = meta?.icon ?? CircleDashed;
  const resolvedStatus = normalized ?? status ?? 'UNKNOWN';
  const label = normalized
    ? t(`admin.modules.meetings.status.${normalized}`, { defaultValue: normalized })
    : t('meetingRoom.status.unknown', { defaultValue: String(resolvedStatus) });
  const tooltip = normalized
    ? t(`admin.modules.meetings.statusTooltip.${normalized}`, { defaultValue: label })
    : label;

  return (
    <span
      className={[
        'admin-meetings-status-badge',
        meta?.badgeClass ?? '',
        `admin-meetings-status-badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={tooltip}
      data-tooltip={tooltip}
    >
      {showIcon ? <Icon className="admin-meetings-status-badge__icon" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
};
