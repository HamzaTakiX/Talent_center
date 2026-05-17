import type { StudentsHistoryRow, StudentsStatCard } from '../types';

export const studentsStats: StudentsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '4,892', icon: 'users' },
  { key: 'updates', label: 'Updates', value: '2,134', icon: 'update' },
  { key: 'creations', label: 'Creations', value: '1,456', icon: 'create' },
  { key: 'deletions', label: 'Deletions', value: '234', icon: 'delete' },
];

export const studentsRows: StudentsHistoryRow[] = [
  {
    id: 'sh-1',
    module: 'Students',
    actionType: 'update',
    title: 'Student profile updated',
    actor: 'Sarah Alami',
    timestamp: '21/04/2026 10:30:00',
  },
  {
    id: 'sh-2',
    module: 'Students',
    actionType: 'create',
    title: 'New student account created',
    actor: 'Admin Registration',
    timestamp: '21/04/2026 09:15:00',
  },
  {
    id: 'sh-3',
    module: 'Students',
    actionType: 'delete',
    title: 'Student profile deleted',
    actor: 'Admin System',
    timestamp: '20/04/2026 16:20:00',
  },
  {
    id: 'sh-4',
    module: 'Students',
    actionType: 'update',
    title: 'Internship assigned to student',
    actor: 'Admin Stage',
    timestamp: '20/04/2026 14:30:00',
  },
];
