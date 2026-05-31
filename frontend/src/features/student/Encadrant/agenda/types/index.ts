export type AgendaCalendarView = 'month' | 'week' | 'day' | 'timeline';

export type AgendaEventCategory =
  | 'meeting'
  | 'deadline'
  | 'evaluation'
  | 'milestone'
  | 'admin'
  | 'financial';

export type AgendaEventStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type AgendaEventPriority = 'high' | 'medium' | 'low';

export type AgendaTaskStatus = 'todo' | 'in_progress' | 'completed';

export type AgendaMeetingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type AgendaTimelineStepStatus = 'completed' | 'current' | 'upcoming';

export interface AgendaPlatformEvent {
  id: string;
  titleKey: string;
  descriptionKey: string;
  startAt: string;
  endAt?: string;
  category: AgendaEventCategory;
  status: AgendaEventStatus;
  priority?: AgendaEventPriority;
  organizerKey: string;
  showJoin?: boolean;
}

export interface AgendaStatCard {
  id: string;
  value: string;
  trend: number;
  iconKey: 'meetings' | 'tasks' | 'deadlines' | 'completed';
}

export interface AgendaPersonalTask {
  id: string;
  titleKey: string;
  dueAt: string;
  priority: AgendaEventPriority;
  status: AgendaTaskStatus;
}

export interface AgendaDeadlineItem {
  id: string;
  titleKey: string;
  dueAt: string;
  daysRemaining: number;
  progress: number;
  priority: AgendaEventPriority;
  category: 'report' | 'document' | 'evaluation' | 'admin';
}

export interface AgendaSupervisorMeeting {
  id: string;
  subjectKey: string;
  date: string;
  time: string;
  status: AgendaMeetingStatus;
  meetingTypeKey: string;
}

export interface AgendaProgressMetric {
  id: string;
  labelKey: string;
  progress: number;
}

export interface AgendaNotification {
  id: string;
  messageKey: string;
  timeKey: string;
  type: 'meeting' | 'deadline' | 'message' | 'evaluation';
}

export interface AgendaTimelineStep {
  id: string;
  labelKey: string;
  status: AgendaTimelineStepStatus;
  dateKey?: string;
}

export interface AgendaExportAction {
  id: string;
  labelKey: string;
  iconKey: 'pdf' | 'excel' | 'ics' | 'google' | 'outlook';
}
