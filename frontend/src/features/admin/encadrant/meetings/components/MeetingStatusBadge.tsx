import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDashed } from 'lucide-react';
import type { MeetingStatus } from '../types/supervisionMeeting';
import { meetingStatusMeta } from '../utils/meetingStatusMeta';

interface MeetingStatusBadgeProps {
  status: MeetingStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const MeetingStatusBadge: FunctionComponent<MeetingStatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
}) => {
  const { t } = useTranslation();
  const meta = meetingStatusMeta[status as MeetingStatus];
  const Icon = meta?.icon ?? CircleDashed;
  const label = t(`admin.modules.meetings.status.${status}`, { defaultValue: String(status) });
  const tooltip = t(`admin.modules.meetings.statusTooltip.${status}`, {
    defaultValue: label,
  });

  return (
    <span
      className={`admin-meetings-status-badge ${meta?.badgeClass ?? ''} admin-meetings-status-badge--${size}`}
      title={tooltip}
      data-tooltip={tooltip}
    >
      {showIcon ? <Icon className="admin-meetings-status-badge__icon" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
};

export default MeetingStatusBadge;
