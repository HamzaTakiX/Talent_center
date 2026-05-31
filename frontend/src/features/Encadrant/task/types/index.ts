export type TaskSummaryTone = 'green' | 'blue' | 'orange';

export type TaskSummaryIcon = 'check' | 'clock' | 'calendar';

export interface TaskSummaryStat {
  label: string;
  value: number;
  tone: TaskSummaryTone;
  icon: TaskSummaryIcon;
}

export interface TaskCreationOption {
  id: 'manual' | 'ai';
  title: string;
  subtitle: string;
}

export interface StudentTaskOverview {
  id: string;
  name: string;
  level: string;
  totalTasks: number;
  nextTaskTitle: string;
  nextTaskDue: string;
  completedTasks: number;
  progressPercent: number;
}

export type {
  StudentTaskDetail,
  StudentTaskItem,
  StudentTaskItemPriority,
  StudentTaskItemStatus,
} from './studentTaskDetail';
