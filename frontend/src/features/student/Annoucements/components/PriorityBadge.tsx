import { FunctionComponent } from 'react';
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

const PriorityBadge: FunctionComponent<PriorityBadgeProps> = ({ priority }) => (
  <span className={priorityClass(priority)}>{priority}</span>
);

export default PriorityBadge;
