import type { AgendaEventPriority } from '../types';

export const AGENDA_PRIORITY_CLASS: Record<AgendaEventPriority, string> = {
  low: 'student-agenda-priority--low',
  medium: 'student-agenda-priority--medium',
  high: 'student-agenda-priority--high',
};
