import type { TasksHistoryRow, TasksStatCard } from '../types';

export const tasksStats: TasksStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '1,123', icon: 'total' },
  { key: 'created', label: 'Created', value: '567', icon: 'created' },
  { key: 'completed', label: 'Completed', value: '456', icon: 'completed' },
  { key: 'updated', label: 'Updated', value: '100', icon: 'updated' },
];

export const tasksHistoryRows: TasksHistoryRow[] = [
  {
    id: 'taskh-1',
    module: 'Tasks',
    actionType: 'create',
    title: 'Task created',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '21/04/2026 09:45:00',
    details: 'A new task was created and assigned in the stage workflow.',
  },
  {
    id: 'taskh-2',
    module: 'Tasks',
    actionType: 'update',
    title: 'Task completed',
    actor: 'Sarah Alami',
    timestamp: '20/04/2026 16:10:00',
    details: 'The task was marked as completed after all checklist items were done.',
  },
  {
    id: 'taskh-3',
    module: 'Tasks',
    actionType: 'update',
    title: 'Task updated',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '19/04/2026 11:30:00',
    details: 'Task details and due date were updated by the encadrant.',
  },
];
