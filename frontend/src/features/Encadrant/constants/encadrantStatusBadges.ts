import type { AdminBadgeVariant } from '../../admin/ui/AdminBadge';
import { adminBadgeClass, REPORT_STATUS_BADGE } from '../../admin/ui/adminStatusBadges';

/**
 * Encadrant report / task status badges — aligned with Student/Admin semantic map.
 * Presentation only; does not change workflow states.
 */
export const ENCADRANT_REPORT_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  ...REPORT_STATUS_BADGE,
  Validated: 'success',
  Approved: 'success',
  Late: 'danger',
  Overdue: 'danger',
  Submitted: 'info',
  Pending: 'warning',
  Rejected: 'danger',
  Draft: 'neutral',
};

export function encadrantReportStatusBadge(status: string): string {
  return adminBadgeClass(ENCADRANT_REPORT_STATUS_BADGE[status] ?? 'neutral');
}

export const ENCADRANT_TASK_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Upcoming: 'info',
  'In Progress': 'warning',
  Done: 'success',
  Completed: 'success',
  Overdue: 'danger',
};

export function encadrantTaskStatusBadge(status: string): string {
  return adminBadgeClass(ENCADRANT_TASK_STATUS_BADGE[status] ?? 'neutral');
}
