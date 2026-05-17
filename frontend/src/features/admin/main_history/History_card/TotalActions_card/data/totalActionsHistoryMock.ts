import type { TotalActionsHistoryRow, TotalActionsStatCard } from '../types';

export const totalActionsStats: TotalActionsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '15,423', icon: 'history' },
  { key: 'today', label: 'Today', value: '234', icon: 'calendar' },
  { key: 'this_week', label: 'This Week', value: '1,892', icon: 'calendar' },
  { key: 'this_month', label: 'This Month', value: '8,567', icon: 'calendar' },
];

export const totalActionsRows: TotalActionsHistoryRow[] = [
  {
    id: 'ta-1',
    module: 'Students',
    type: 'update',
    title: 'Student profile updated',
    actor: 'Sarah Alami',
    timestamp: '21/04/2026 10:30:00',
  },
  {
    id: 'ta-2',
    module: 'Students',
    type: 'create',
    title: 'New student account created',
    actor: 'Admin Registration',
    timestamp: '21/04/2026 09:15:00',
  },
  {
    id: 'ta-3',
    module: 'Students',
    type: 'delete',
    title: 'Student profile deleted',
    actor: 'Admin System',
    timestamp: '20/04/2026 16:20:00',
  },
  {
    id: 'ta-4',
    module: 'Students',
    type: 'update',
    title: 'Internship assigned to student',
    actor: 'Admin Stage',
    timestamp: '20/04/2026 14:30:00',
  },
  {
    id: 'ta-5',
    module: 'Admins',
    type: 'update',
    title: 'Admin role updated',
    actor: 'Super Admin',
    timestamp: '21/04/2026 11:00:00',
  },
];
