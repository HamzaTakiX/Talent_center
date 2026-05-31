export type TasksInProgressSummaryTone = 'green' | 'blue' | 'orange';

export type TasksInProgressSummaryIcon = 'total' | 'completed' | 'pending';

export interface TasksInProgressSummaryStat {
  label: string;
  value: number;
  tone: TasksInProgressSummaryTone;
  icon: TasksInProgressSummaryIcon;
}

export interface TasksInProgressStudent {
  id: string;
  name: string;
  level: string;
  totalTasks: number;
  nextTaskTitle: string;
  nextTaskDue: string;
  completedTasks: number;
  progressPercent: number;
}
