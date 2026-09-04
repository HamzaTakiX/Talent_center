import type { LucideIcon } from 'lucide-react';

export type EncadrantStatIconKey = 'tasks' | 'meetings' | 'report' | 'deadline';

export interface EncadrantStatItem {
  label: string;
  value: string;
  iconKey: EncadrantStatIconKey;
}

export type EncadrantTaskPriority = 'high' | 'medium';
export type EncadrantTaskStatus = 'in_progress' | 'todo' | 'in_review';

export interface EncadrantMeetingItem {
  id: string;
  title: string;
  dateTime: string;
  startAt?: string;
  meetingId?: number;
}

export interface EncadrantTaskItem {
  id: string;
  title: string;
  priority: EncadrantTaskPriority;
  dueDate: string;
  status: EncadrantTaskStatus;
}

export interface EncadrantReportChapter {
  id: string;
  label: string;
  progress: number;
}

export interface EncadrantQuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  path: string;
}

export type EncadrantAlertSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface EncadrantPriorityAlert {
  id: string;
  titleKey: string;
  messageKey: string;
  severity: EncadrantAlertSeverity;
}

export interface EncadrantMilestone {
  id: string;
  labelKey: string;
  status: 'completed' | 'current' | 'upcoming';
  dateKey?: string;
}

export interface EncadrantSupervisor {
  initials: string;
  name: string;
  department: string;
  specialty: string;
  email: string;
  avatarUrl: string;
}
