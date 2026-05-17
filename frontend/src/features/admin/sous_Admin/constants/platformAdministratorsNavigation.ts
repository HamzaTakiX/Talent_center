import type { PlatformAdminKpiStatKey } from '../types/platformAdministrators';

/** Clé KPI → route liste associée. */
export const PLATFORM_ADMIN_KPI_STAT_TO_PATH: Record<PlatformAdminKpiStatKey, string> = {
  total: '/admin/admins/all-administrators',
  stage: '/admin/admins/stage-administrators',
  finance: '/admin/admins/finance-administrators',
  documents: '/admin/admins/documents-administrators',
  communication: '/admin/admins/communication-administrators',
};
