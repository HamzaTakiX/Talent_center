import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AdminPermissionKey,
  PlatformAdminRoleVariant,
} from '../sous_Admin/types/platformAdministrators';

export type { AdminPermissionKey } from '../sous_Admin/types/platformAdministrators';

const OFFER_STATUS_KEY: Record<string, string> = {
  Active: 'active',
  Draft: 'draft',
  Expired: 'expired',
  Closed: 'closed',
};

const DOCUMENT_STATUS_KEY: Record<string, string> = {
  Validated: 'validated',
  Pending: 'pending',
  Rejected: 'rejected',
};

const REPORT_STATUS_KEY: Record<string, string> = {
  Submitted: 'submitted',
  Pending: 'pending',
  Approved: 'approved',
  Overdue: 'overdue',
};

const ACCOUNT_STATUS_KEY: Record<string, string> = {
  Active: 'active',
  Inactive: 'inactive',
};

const INTERNSHIP_STATUS_KEY: Record<string, string> = {
  Assigned: 'assigned',
  Searching: 'searching',
  None: 'none',
};

const ANNOUNCEMENT_TYPE_KEY: Record<string, string> = {
  Event: 'event',
  Interview: 'interview',
  Info: 'info',
};

const ENGAGEMENT_KEY: Record<string, string> = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const SRF_PAYMENT_KEY: Record<string, string> = {
  Paid: 'paid',
  Unpaid: 'unpaid',
  'Partially Paid': 'partiallyPaid',
  'Pending Validation': 'pendingValidation',
  Late: 'late',
  Exempted: 'exempted',
  Blocked: 'blocked',
};

const PERMISSION_LABEL_TO_KEY: Record<string, AdminPermissionKey> = {
  'Internship Management': 'internshipManagement',
  'Financial Operations': 'financialOperations',
  'Document Validation': 'documentValidation',
  'Announcements & Notifications': 'announcementsNotifications',
};

/** Translates mock/table enum values shown in admin data grids. */
export function useAdminTableValues() {
  const { t, i18n } = useTranslation();

  const translate = useCallback(
    (path: string, fallback: string) => {
      const key = `admin.values.${path}`;
      const out = t(key);
      return out === key ? fallback : out;
    },
    [t, i18n.language]
  );

  const adminRole = useCallback(
    (variant: PlatformAdminRoleVariant) => translate(`adminRoles.${variant}`, variant),
    [translate]
  );

  const adminPermission = useCallback(
    (key: AdminPermissionKey | string) => {
      const resolved = PERMISSION_LABEL_TO_KEY[key] ?? (key as AdminPermissionKey);
      return translate(`adminPermissions.${resolved}`, key);
    },
    [translate]
  );

  const accountStatus = useCallback(
    (status: string) => {
      const k = ACCOUNT_STATUS_KEY[status];
      return k ? translate(`accountStatus.${k}`, status) : status;
    },
    [translate]
  );

  const offerStatus = useCallback(
    (status: string) => {
      const k = OFFER_STATUS_KEY[status];
      return k ? translate(`offerStatus.${k}`, status) : status;
    },
    [translate]
  );

  const documentStatus = useCallback(
    (status: string) => {
      const k = DOCUMENT_STATUS_KEY[status];
      return k ? translate(`documentStatus.${k}`, status) : status;
    },
    [translate]
  );

  const reportStatus = useCallback(
    (status: string) => {
      const k = REPORT_STATUS_KEY[status];
      return k ? translate(`reportStatus.${k}`, status) : status;
    },
    [translate]
  );

  const internshipStatus = useCallback(
    (status: string) => {
      const k = INTERNSHIP_STATUS_KEY[status];
      return k ? translate(`internshipStatus.${k}`, status) : status;
    },
    [translate]
  );

  const announcementType = useCallback(
    (type: string) => {
      const k = ANNOUNCEMENT_TYPE_KEY[type];
      return k ? translate(`announcementType.${k}`, type) : type;
    },
    [translate]
  );

  const engagementBand = useCallback(
    (band: string) => {
      const k = ENGAGEMENT_KEY[band];
      return k ? translate(`engagement.${k}`, band) : band;
    },
    [translate]
  );

  const srfPaymentStatus = useCallback(
    (status: string) => {
      const k = SRF_PAYMENT_KEY[status];
      return k ? t(`admin.tables.filter.srfPaymentStatus.${k}`) : status;
    },
    [t, i18n.language]
  );

  return {
    adminRole,
    adminPermission,
    accountStatus,
    offerStatus,
    documentStatus,
    reportStatus,
    internshipStatus,
    announcementType,
    engagementBand,
    srfPaymentStatus,
  };
}
