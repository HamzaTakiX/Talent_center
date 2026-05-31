import type { TasksInProgressStudent, TasksInProgressSummaryStat } from '../types';

export const tasksInProgressSummaryMock: TasksInProgressSummaryStat[] = [
  { label: 'Total Tasks', value: 85, tone: 'green', icon: 'total' },
  { label: 'Completed Tasks', value: 45, tone: 'blue', icon: 'completed' },
  { label: 'Pending Tasks', value: 40, tone: 'orange', icon: 'pending' },
];

export const tasksInProgressStudentsMock: TasksInProgressStudent[] = [
  {
    id: 'tip-1',
    name: 'Sarah Alami',
    level: 'Master 2',
    totalTasks: 12,
    nextTaskTitle: 'Complete User Interface Mockups',
    nextTaskDue: '25/04/2026',
    completedTasks: 8,
    progressPercent: 67,
  },
  {
    id: 'tip-2',
    name: 'Youssef Benani',
    level: 'Master 2',
    totalTasks: 15,
    nextTaskTitle: 'Implement Smart Contract Logic',
    nextTaskDue: '23/04/2026',
    completedTasks: 6,
    progressPercent: 40,
  },
  {
    id: 'tip-3',
    name: 'Mohamed Idrissi',
    level: 'Master 1',
    totalTasks: 14,
    nextTaskTitle: 'Integrate Sensors with Gateway',
    nextTaskDue: '26/04/2026',
    completedTasks: 8,
    progressPercent: 57,
  },
  {
    id: 'tip-4',
    name: 'Karim El Fassi',
    level: 'Master 1',
    totalTasks: 13,
    nextTaskTitle: 'Fix Authentication Bugs',
    nextTaskDue: '21/04/2026',
    completedTasks: 4,
    progressPercent: 31,
  },
];
