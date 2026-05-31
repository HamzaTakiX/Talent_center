export type TaskViewMode = 'list' | 'kanban' | 'timeline' | 'calendar';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskCategory =
  | 'internship'
  | 'reports'
  | 'meetings'
  | 'documents'
  | 'administrative'
  | 'srf'
  | 'personal';

export type TaskRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type TaskAlertSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface StudentPlatformTask {
  id: string;
  titleKey: string;
  descriptionKey: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueAt: string;
  daysRemaining: number;
  progress: number;
  supervisorKey: string;
  assignedByKey?: string;
  assignedAt?: string;
  feedbackStatusKey?: string;
  fromSupervisor?: boolean;
}

export interface TaskKpiStat {
  id: string;
  value: string;
  trend: number;
  sparkline: number[];
}

export interface TaskProgressMetric {
  id: string;
  labelKey: string;
  progress: number;
}

export interface TaskPriorityAlert {
  id: string;
  titleKey: string;
  messageKey: string;
  severity: TaskAlertSeverity;
}

export interface TaskDeadlineItem {
  id: string;
  titleKey: string;
  dueAt: string;
  daysRemaining: number;
  risk: TaskRiskLevel;
}

export interface TaskMilestone {
  id: string;
  labelKey: string;
  status: 'completed' | 'current' | 'upcoming';
  dateKey?: string;
}

export interface TaskNotification {
  id: string;
  messageKey: string;
  timeKey: string;
}

export interface TaskActivityItem {
  id: string;
  messageKey: string;
  timeKey: string;
}

export type TaskFilterStatus = TaskStatus | 'all';
export type TaskFilterPriority = TaskPriority | 'all';
export type TaskFilterCategory = TaskCategory | 'all';

export interface TaskFilters {
  status: TaskFilterStatus;
  priority: TaskFilterPriority;
  category: TaskFilterCategory;
  supervisor: string;
  dueRange: 'all' | 'week' | 'month' | 'overdue';
  completion: 'all' | 'incomplete' | 'complete';
}
