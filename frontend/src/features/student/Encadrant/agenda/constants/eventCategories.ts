import type { AgendaEventCategory, AgendaEventType } from '../types';

export const AGENDA_CATEGORY_CLASS: Record<AgendaEventCategory, string> = {
  meeting: 'student-agenda-event--meeting',
  deadline: 'student-agenda-event--deadline',
  evaluation: 'student-agenda-event--evaluation',
  milestone: 'student-agenda-event--milestone',
  admin: 'student-agenda-event--admin',
  financial: 'student-agenda-event--financial',
  reminder: 'student-agenda-event--reminder',
  out_of_office: 'student-agenda-event--out-of-office',
  other: 'student-agenda-event--other',
};

export const AGENDA_CATEGORY_DOT_CLASS: Record<AgendaEventCategory, string> = {
  meeting: 'student-agenda-dot--meeting',
  deadline: 'student-agenda-dot--deadline',
  evaluation: 'student-agenda-dot--evaluation',
  milestone: 'student-agenda-dot--milestone',
  admin: 'student-agenda-dot--admin',
  financial: 'student-agenda-dot--financial',
  reminder: 'student-agenda-dot--reminder',
  out_of_office: 'student-agenda-dot--out-of-office',
  other: 'student-agenda-dot--other',
};

/**
 * Category order for the sidebar legend and the type picker.
 *
 * Kept in sync with `UI_TYPE` in `apps/agenda/serializers.py`; every backend
 * event type maps into exactly one of these, so nothing can arrive uncoloured.
 */
export const AGENDA_LEGEND_CATEGORIES: AgendaEventCategory[] = [
  'meeting',
  'deadline',
  'evaluation',
  'milestone',
  'admin',
  'financial',
  'reminder',
  'out_of_office',
  'other',
];

/** UI category → the enum value the API filters and writes on. */
export const AGENDA_CATEGORY_TO_TYPE: Record<AgendaEventCategory, AgendaEventType> = {
  meeting: 'MEETING',
  deadline: 'DEADLINE',
  evaluation: 'EVALUATION',
  milestone: 'MILESTONE',
  admin: 'ADMINISTRATIVE',
  financial: 'FINANCE',
  reminder: 'REMINDER',
  out_of_office: 'OUT_OF_OFFICE',
  other: 'OTHER',
};
