export type TasksDoneSummaryTone = 'green' | 'blue' | 'orange';

export type TasksDoneSummaryIcon = 'total' | 'completed' | 'pending';

export interface TasksDoneSummaryStat {
  label: string;
  value: number;
  tone: TasksDoneSummaryTone;
  icon: TasksDoneSummaryIcon;
}

export interface TasksDoneStudent {
  id: string;
  name: string;
  level: string;
  totalTasks: number;
  nextTaskTitle: string;
  nextTaskDue: string;
  completedTasks: number;
  progressPercent: number;
}
