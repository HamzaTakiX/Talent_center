import type { LucideIcon } from 'lucide-react';
import type {
  AdminAccountStatus,
  AdminAdministratorRow,
  AdminPermissionKey,
  AdminRoleSlug,
} from '../../api/types';

export type PlatformAdminRoleVariant = AdminRoleSlug;

export type { AdminPermissionKey, AdminAdministratorRow, AdminAccountStatus, AdminRoleSlug };

/** Table row — API-backed administrator record. */
export type PlatformAdministratorRow = AdminAdministratorRow;

export type PlatformAdminKpiStatKey = 'total' | PlatformAdminRoleVariant;

export interface PlatformAdministratorsKpiStat {
  label: string;
  labelKey: string;
  statKey: PlatformAdminKpiStatKey;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

/** Filtre des pages liste (tous les admins ou par rôle). */
export type AdministratorListFilter = 'all' | PlatformAdminRoleVariant;
