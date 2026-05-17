export type CreateAdminPermissionKey =
  | 'manageInternshipOffers'
  | 'createAnnouncements'
  | 'financialOperations'
  | 'userManagement'
  | 'manageStudents'
  | 'validateDocuments'
  | 'accessReports'
  | 'platformSettings';

export const CREATE_ADMIN_PERMISSIONS_COL_A: readonly CreateAdminPermissionKey[] = [
  'manageInternshipOffers',
  'createAnnouncements',
  'financialOperations',
  'userManagement',
];

export const CREATE_ADMIN_PERMISSIONS_COL_B: readonly CreateAdminPermissionKey[] = [
  'manageStudents',
  'validateDocuments',
  'accessReports',
  'platformSettings',
];

export type CreateAdminRoleValue = '' | 'stage' | 'finance' | 'documents' | 'communication';

export const CREATE_ADMIN_ROLE_OPTIONS: readonly { value: CreateAdminRoleValue; labelKey: string }[] = [
  { value: '', labelKey: 'select' },
  { value: 'stage', labelKey: 'stage' },
  { value: 'finance', labelKey: 'finance' },
  { value: 'documents', labelKey: 'documents' },
  { value: 'communication', labelKey: 'communication' },
];
