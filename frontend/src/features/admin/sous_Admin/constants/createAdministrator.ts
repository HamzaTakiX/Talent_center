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

export type CreateAdminRoleValue =
  | 'stage'
  | 'finance'
  | 'documents'
  | 'communication'
  | 'coordinator'
  | 'academic';

export const CREATE_ADMIN_ROLE_OPTIONS: readonly { value: CreateAdminRoleValue; labelKey: string }[] = [
  { value: 'stage', labelKey: 'stage' },
  { value: 'finance', labelKey: 'finance' },
  { value: 'documents', labelKey: 'documents' },
  { value: 'communication', labelKey: 'communication' },
  { value: 'coordinator', labelKey: 'coordinator' },
  { value: 'academic', labelKey: 'academic' },
];

export const ACCOUNT_STATUS_OPTIONS = [
  'PENDING',
  'AUTHORIZED',
  'ACTIVE',
  'SUSPENDED',
  'BLOCKED',
  'ARCHIVED',
] as const;
