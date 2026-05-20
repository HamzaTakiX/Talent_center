import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { priorityMeta } from '../utils/announcementMeta';

interface Props {
  priority: string;
}

const AnnouncementPriorityBadge: FunctionComponent<Props> = ({ priority }) => {
  const { t } = useTranslation();
  const meta = priorityMeta[priority] ?? priorityMeta.NORMAL;
  const Icon = meta.icon;

  return (
    <span className={`admin-ann-priority-badge ${meta.badgeClass}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {t(`admin.announcementsModule.form.priorities.${priority}`, { defaultValue: priority })}
    </span>
  );
};

export default AnnouncementPriorityBadge;
