import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { statusMeta } from '../utils/announcementMeta';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const AnnouncementStatusBadge: FunctionComponent<Props> = ({ status, size = 'sm' }) => {
  const { t } = useTranslation();
  const meta = statusMeta[status] ?? statusMeta.DRAFT;
  const Icon = meta.icon;

  return (
    <span className={`admin-ann-status-badge ${meta.badgeClass}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {t(`admin.announcementsModule.status.${status}`, { defaultValue: status })}
    </span>
  );
};

export default AnnouncementStatusBadge;
