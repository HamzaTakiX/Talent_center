export type TasksUpcomingSummaryTone = 'green' | 'blue' | 'orange';

export type TasksUpcomingSummaryIcon = 'total' | 'completed' | 'pending';

export interface TasksUpcomingSummaryStat {
  label: string;
  value: number;
  tone: TasksUpcomingSummaryTone;
  icon: TasksUpcomingSummaryIcon;
}

export interface TasksUpcomingStudent {
  id: string;
  name: string;
  level: string;
  totalTasks: number;
  nextTaskTitle: string;
  nextTaskDue: string;
  completedTasks: number;
  progressPercent: number;
}
