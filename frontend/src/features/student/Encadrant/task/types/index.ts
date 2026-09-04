export type TaskViewMode = 'list' | 'kanban' | 'activity' | 'calendar';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskCategory =
  | 'internship'
  | 'reports'
  | 'meetings'
  | 'documents'
  | 'administrative'
  | 'srf';

export type TaskRiskLevel = 'low' | 'medium' | 'high' | 'critical';

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
  /** Share of the total task backlog. Omit to hide the donut. */
  ratio?: number;
}

export interface TaskProgressMetric {
  id: string;
  labelKey: string;
  progress: number;
}

export interface TaskDeadlineItem {
  id: string;
  titleKey: string;
  dueAt: string;
  daysRemaining: number;
  risk: TaskRiskLevel;
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

export type TaskFeedActivityType =
  | 'upload'
  | 'comment'
  | 'feedback'
  | 'meeting'
  | 'task'
  | 'report';

export interface TaskFeedActivityItem {
  id: string;
  type: TaskFeedActivityType;
  messageKey: string;
  timeKey: string;
  actorKey: string;
  taskId?: string;
}

export type TaskFilterStatus = TaskStatus | 'all';
export type TaskFilterPriority = TaskPriority | 'all';
export type TaskFilterCategory = TaskCategory | 'all';

export type TaskSortKey = 'dueAsc' | 'dueDesc' | 'priority' | 'progress' | 'title';

export interface TaskFilters {
  status: TaskFilterStatus;
  priority: TaskFilterPriority;
  category: TaskFilterCategory;
  supervisor: string;
  dueRange: 'all' | 'week' | 'month' | 'overdue';
  completion: 'all' | 'incomplete' | 'complete';
}
