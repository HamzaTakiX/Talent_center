import type { PlatformAdministratorRow } from '../types/platformAdministrators';

export type { PlatformAdministratorRow, PlatformAdminRoleVariant } from '../types/platformAdministrators';

const baseScope = {
  filiere_ids: [],
  class_group_ids: [],
  level_ids: [],
  sector_ids: [],
  levels: [],
  academic_years: [],
  filiere_labels: [],
  class_group_labels: [],
};

export const platformAdministratorsRows: PlatformAdministratorRow[] = [
  {
    id: 1,
    email: 'karim.elamrani@esca.ma',
    full_name: 'Karim El Amrani',
    first_name: 'Karim',
    last_name: 'El Amrani',
    account_status: 'ACTIVE',
    auth_provider: 'LOCAL',
    platform_access_granted: true,
    sso_enabled: false,
    first_login_completed: true,
    is_active: true,
    admin_level: 'STANDARD',
    is_admin_active: true,
    role_slugs: ['stage'],
    permission_keys: ['manageInternshipOffers'],
    scopes: baseScope,
    last_login_at: null,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'nadia.benjelloun@esca.ma',
    full_name: 'Nadia Benjelloun',
    first_name: 'Nadia',
    last_name: 'Benjelloun',
    account_status: 'ACTIVE',
    auth_provider: 'LOCAL',
    platform_access_granted: true,
    sso_enabled: false,
    first_login_completed: true,
    is_active: true,
    admin_level: 'STANDARD',
    is_admin_active: true,
    role_slugs: ['finance'],
    permission_keys: ['financialOperations'],
    scopes: baseScope,
    last_login_at: null,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
  },
];
