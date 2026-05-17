import type { PlatformAdministratorRow } from '../types/platformAdministrators';

export type { PlatformAdministratorRow, PlatformAdminRoleVariant } from '../types/platformAdministrators';

export const platformAdministratorsRows: PlatformAdministratorRow[] = [
  {
    id: '1',
    name: 'Karim El Amrani',
    roleLabel: 'Admin Stage',
    roleVariant: 'stage',
    permissionLabel: 'Internship Management',
    permissionKey: 'internshipManagement',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Nadia Benjelloun',
    roleLabel: 'Admin Finance',
    roleVariant: 'finance',
    permissionLabel: 'Financial Operations',
    permissionKey: 'financialOperations',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Hassan Tazi',
    roleLabel: 'Admin Documents',
    roleVariant: 'documents',
    permissionLabel: 'Document Validation',
    permissionKey: 'documentValidation',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Samira Idrissi',
    roleLabel: 'Admin Communication',
    roleVariant: 'communication',
    permissionLabel: 'Announcements & Notifications',
    permissionKey: 'announcementsNotifications',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Omar Khalil',
    roleLabel: 'Admin Stage',
    roleVariant: 'stage',
    permissionLabel: 'Internship Management',
    permissionKey: 'internshipManagement',
    status: 'Active',
  },
];
