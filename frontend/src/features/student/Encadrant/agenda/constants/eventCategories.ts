import type { AgendaEventCategory } from '../types';

export const AGENDA_CATEGORY_CLASS: Record<AgendaEventCategory, string> = {
  meeting: 'student-agenda-event--meeting',
  deadline: 'student-agenda-event--deadline',
  evaluation: 'student-agenda-event--evaluation',
  milestone: 'student-agenda-event--milestone',
  admin: 'student-agenda-event--admin',
  financial: 'student-agenda-event--financial',
};

export const AGENDA_CATEGORY_DOT_CLASS: Record<AgendaEventCategory, string> = {
  meeting: 'student-agenda-dot--meeting',
  deadline: 'student-agenda-dot--deadline',
  evaluation: 'student-agenda-dot--evaluation',
  milestone: 'student-agenda-dot--milestone',
  admin: 'student-agenda-dot--admin',
  financial: 'student-agenda-dot--financial',
};

export const AGENDA_LEGEND_CATEGORIES: AgendaEventCategory[] = [
  'meeting',
  'deadline',
  'evaluation',
  'milestone',
  'admin',
  'financial',
];
