import type { PlatformAdminKpiStatKey } from '../types/platformAdministrators';

/** Clé KPI cliquable → route liste associée (hors « total », resté sur /admin/admins). */
export const PLATFORM_ADMIN_KPI_STAT_TO_PATH: Record<
  Exclude<PlatformAdminKpiStatKey, 'total'>,
  string
> = {
  super: '/admin/admins',
  stage: '/admin/admins/stage-administrators',
  finance: '/admin/admins/finance-administrators',
  documents: '/admin/admins/documents-administrators',
  communication: '/admin/admins/communication-administrators',
  coordinator: '/admin/admins',
  academic: '/admin/admins',
};
