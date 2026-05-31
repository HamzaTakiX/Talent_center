import type { StudentTaskOverview, TaskCreationOption, TaskSummaryStat } from '../types';

export const taskSummaryMock: TaskSummaryStat[] = [
  { label: 'Tasks Done', value: 45, tone: 'green', icon: 'check' },
  { label: 'Tasks In Progress', value: 28, tone: 'blue', icon: 'clock' },
  { label: 'Tasks Upcoming', value: 12, tone: 'orange', icon: 'calendar' },
];

export const taskCreationOptionsMock: TaskCreationOption[] = [
  {
    id: 'manual',
    title: 'Create Task Manually',
    subtitle: 'Add tasks one by one with custom details',
  },
  {
    id: 'ai',
    title: 'AI Task Creation',
    subtitle: 'Upload a document and generate tasks with AI',
  },
];

export const studentTaskOverviewMock: StudentTaskOverview[] = [
  {
    id: 'st-1',
    name: 'Sarah Alami',
    level: 'Master 2',
    totalTasks: 12,
    nextTaskTitle: 'Complete User Interface Mockups',
    nextTaskDue: '25/04/2026',
    completedTasks: 8,
    progressPercent: 67,
  },
  {
    id: 'st-2',
    name: 'Youssef Benani',
    level: 'Master 2',
    totalTasks: 15,
    nextTaskTitle: 'Implement Smart Contract Logic',
    nextTaskDue: '23/04/2026',
    completedTasks: 6,
    progressPercent: 40,
  },
  {
    id: 'st-3',
    name: 'Amina Khalil',
    level: 'Master 2',
    totalTasks: 10,
    nextTaskTitle: 'Final Model Testing',
    nextTaskDue: '28/04/2026',
    completedTasks: 9,
    progressPercent: 90,
  },
];
