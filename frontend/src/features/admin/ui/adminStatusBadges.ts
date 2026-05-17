import type { AdminBadgeVariant } from './AdminBadge';

/** Classes badge design system (light + dark via admin-dashboard.css). */
export function adminBadgeClass(variant: AdminBadgeVariant, extra = ''): string {
  return ['admin-badge', `admin-badge--${variant}`, extra].filter(Boolean).join(' ');
}

export const OFFER_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Active: 'success',
  Draft: 'warning',
  Expired: 'danger',
  Closed: 'neutral',
};

export const ANNOUNCEMENT_TYPE_BADGE: Record<string, AdminBadgeVariant> = {
  Event: 'event',
  Interview: 'interview',
  Info: 'success',
};

export const DOCUMENT_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Validated: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

export const SRF_PAYMENT_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Paid: 'success',
  Unpaid: 'danger',
  'Partially Paid': 'warning',
  'Pending Validation': 'info',
  Late: 'danger',
  Exempted: 'info',
  Blocked: 'neutral',
};

export const INTERNSHIP_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Assigned: 'success',
  Searching: 'warning',
  None: 'danger',
};

export const STUDENT_ACCOUNT_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Active: 'success',
  Inactive: 'neutral',
};

export const ENGAGEMENT_BAND_BADGE: Record<string, AdminBadgeVariant> = {
  High: 'success',
  Medium: 'warning',
  Low: 'neutral',
};

export const PLATFORM_ADMIN_ROLE_BADGE: Record<string, AdminBadgeVariant> = {
  stage: 'event',
  finance: 'success',
  documents: 'warning',
  communication: 'interview',
};

export const REPORT_STATUS_BADGE: Record<string, AdminBadgeVariant> = {
  Submitted: 'info',
  Pending: 'warning',
  Approved: 'success',
  Overdue: 'danger',
};

/** Compact pill for table cells. */
export const ADMIN_TABLE_BADGE = 'rounded-full px-2.5 py-1 text-xs font-semibold leading-4';

/** Slightly rounded for offer/announcement chips. */
export const ADMIN_CHIP_BADGE = 'rounded-lg px-2 py-0.5 text-xs font-medium leading-4';

export function tableBadge(variant: AdminBadgeVariant, extra = ''): string {
  return adminBadgeClass(variant, [ADMIN_TABLE_BADGE, extra].filter(Boolean).join(' '));
}

export function offerStatusTableBadge(status: string): string {
  return tableBadge(OFFER_STATUS_BADGE[status] ?? 'neutral');
}

export function internshipStatusTableBadge(status: string): string {
  return tableBadge(INTERNSHIP_STATUS_BADGE[status] ?? 'neutral');
}

export function documentStatusTableBadge(status: string): string {
  return tableBadge(DOCUMENT_STATUS_BADGE[status] ?? 'neutral');
}

export function announcementTypeTableBadge(type: string): string {
  return tableBadge(ANNOUNCEMENT_TYPE_BADGE[type] ?? 'neutral');
}

export function srfPaymentTableBadge(status: string): string {
  return tableBadge(SRF_PAYMENT_STATUS_BADGE[status] ?? 'neutral');
}

export function reportStatusTableBadge(status: string): string {
  return tableBadge(REPORT_STATUS_BADGE[status] ?? 'neutral');
}

export function studentAccountTableBadge(status: string): string {
  return tableBadge(STUDENT_ACCOUNT_STATUS_BADGE[status] ?? 'neutral');
}

export function engagementBandTableBadge(band: string): string {
  return tableBadge(ENGAGEMENT_BAND_BADGE[band] ?? 'neutral');
}

export function platformAdminRoleTableBadge(role: string): string {
  return tableBadge(PLATFORM_ADMIN_ROLE_BADGE[role] ?? 'neutral');
}
