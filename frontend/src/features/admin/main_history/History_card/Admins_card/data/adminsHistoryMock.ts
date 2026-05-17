import type { AdminHistoryRow, AdminStatCard } from '../types';

export const adminsStats: AdminStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '2,156', icon: 'total' },
  { key: 'role_updates', label: 'Role Updates', value: '892', icon: 'update' },
  { key: 'new_admins', label: 'New Admins', value: '45', icon: 'create' },
  { key: 'permission_changes', label: 'Permission Changes', value: '567', icon: 'permission' },
];

export const adminsRows: AdminHistoryRow[] = [
  {
    id: 'ah-1',
    module: 'Admins',
    actionType: 'update',
    title: 'Admin role updated',
    actor: 'Super Admin',
    timestamp: '21/04/2026 11:00:00',
    details: 'Updated role assignment and access scope for this administrator.',
  },
  {
    id: 'ah-2',
    module: 'Admins',
    actionType: 'create',
    title: 'New admin account created',
    actor: 'Super Admin',
    timestamp: '20/04/2026 10:00:00',
    details: 'Created a new administrator account with initial default permissions.',
  },
  {
    id: 'ah-3',
    module: 'Admins',
    actionType: 'update',
    title: 'Admin permissions modified',
    actor: 'Super Admin',
    timestamp: '19/04/2026 15:45:00',
    details: 'Modified permissions matrix and reporting privileges for this admin.',
  },
];
