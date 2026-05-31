import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnnouncementPriority } from '../types';
import {
  PRIORITY_BADGE_IMPORTANT,
  PRIORITY_BADGE_NORMAL,
  PRIORITY_BADGE_URGENT,
} from '../constants/allAnnouncementsStyles';

interface PriorityBadgeProps {
  priority: AnnouncementPriority;
}

function priorityClass(priority: AnnouncementPriority): string {
  switch (priority) {
    case 'Urgent':
      return PRIORITY_BADGE_URGENT;
    case 'Important':
      return PRIORITY_BADGE_IMPORTANT;
    default:
      return PRIORITY_BADGE_NORMAL;
  }
}

function priorityKey(priority: AnnouncementPriority): 'urgent' | 'important' | 'normal' {
  switch (priority) {
    case 'Urgent':
      return 'urgent';
    case 'Important':
      return 'important';
    default:
      return 'normal';
  }
}

const PriorityBadge: FunctionComponent<PriorityBadgeProps> = ({ priority }) => {
  const { t } = useTranslation();

  return (
    <span className={priorityClass(priority)}>
      {t(`student.announcements.priority.${priorityKey(priority)}`)}
    </span>
  );
};

export default PriorityBadge;
