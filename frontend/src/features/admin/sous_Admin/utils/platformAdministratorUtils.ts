import type { AdminAdministratorRow } from '../../api/types';
import type { PlatformAdminRoleVariant } from '../types/platformAdministrators';

export function isSuperAdminAdministrator(row: AdminAdministratorRow): boolean {
  return row.is_super_admin === true || row.admin_level === 'SUPER';
}

export function administratorRoleSlugs(row: AdminAdministratorRow): PlatformAdminRoleVariant[] {
  if (isSuperAdminAdministrator(row)) {
    return ['super'];
  }
  return row.role_slugs as PlatformAdminRoleVariant[];
}
