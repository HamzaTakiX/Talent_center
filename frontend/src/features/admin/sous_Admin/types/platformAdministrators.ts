import type { LucideIcon } from 'lucide-react';

export type PlatformAdminRoleVariant = 'stage' | 'finance' | 'documents' | 'communication';

export type AdminPermissionKey =
  | 'internshipManagement'
  | 'financialOperations'
  | 'documentValidation'
  | 'announcementsNotifications';

export interface PlatformAdministratorRow {
  id: string;
  name: string;
  /** Legacy display string — prefer roleVariant + i18n. */
  roleLabel: string;
  roleVariant: PlatformAdminRoleVariant;
  /** Legacy display string — prefer permissionKey + i18n. */
  permissionLabel: string;
  permissionKey: AdminPermissionKey;
  status: 'Active';
}

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
