import type { User } from '../types';
import { normalizeRole } from './roleAuth';

/**
 * Admin module gating, driven by the backend RBAC codes returned by
 * `GET /api/auth/me` (`permission_codes`, `is_super_admin`).
 *
 * This mirrors the server-side `required_permission` on the corresponding DRF
 * views; it exists so the UI does not offer navigation that the API will refuse.
 * It is NOT the security boundary — every endpoint enforces the same code.
 */

/** Permission codes as seeded by `apps/admin_management/services/rbac_seed.py`. */
export type PermissionCode = string;

interface ModuleRule {
  /** URL prefix, matched on a path segment boundary. */
  prefix: string;
  /** Access is granted when the user holds at least one of these codes. */
  anyOf: PermissionCode[];
}

const ANNOUNCEMENTS = [
  'announcements.view',
  'announcements.create',
  'announcements.edit',
  'announcements.publish',
  'announcements.archive',
  'announcements.analytics',
  'announcements.targeting',
  'announcements.types.manage',
  'announcements.recommendation.manage',
];

const DOCUMENTS = [
  'documents.validate',
  'documents.manage',
  'documents.reservations',
  'documents.templates',
  'documents.analytics',
];

const FINANCE = ['finance.manage', 'srf.financial.manage', 'srf.import', 'srf.financial.audit'];

const HISTORY = ['history.global.access', 'history.entity.read', 'history.export'];

/**
 * Ordered at module load from the most specific prefix to the least, so
 * `/admin/encadrant/reports` is resolved before `/admin/encadrant`.
 */
const MODULE_RULES: ModuleRule[] = [
  // Internship offers
  { prefix: '/admin/internship-offers', anyOf: ['internship.manage'] },
  { prefix: '/admin/active-internship-offers', anyOf: ['internship.manage'] },
  { prefix: '/admin/ongoing-applications', anyOf: ['internship.manage'] },
  { prefix: '/admin/students-without-internship', anyOf: ['internship.manage'] },

  // Finance / SRF
  { prefix: '/admin/srf', anyOf: FINANCE },
  { prefix: '/admin/students-unpaid-srf', anyOf: FINANCE },

  // Announcements
  { prefix: '/admin/announcements', anyOf: ANNOUNCEMENTS },

  // Documents
  { prefix: '/admin/documents', anyOf: DOCUMENTS },
  { prefix: '/admin/documents-pending-validation', anyOf: DOCUMENTS },

  // Supervision (encadrants)
  { prefix: '/admin/encadrant/reports', anyOf: ['reports.access', 'reports.review'] },
  { prefix: '/admin/encadrant/meetings', anyOf: ['meetings.access', 'meetings.manage'] },
  { prefix: '/admin/encadrant/smart-assignment', anyOf: ['users.manage', 'students.manage'] },
  { prefix: '/admin/encadrant', anyOf: ['users.manage', 'reports.access', 'meetings.access'] },
  { prefix: '/admin/encadrants', anyOf: ['users.manage'] },
  { prefix: '/admin/dashboard/encadrants', anyOf: ['users.manage'] },

  // Students
  { prefix: '/admin/students', anyOf: ['students.manage'] },
  { prefix: '/admin/student', anyOf: ['students.manage'] },
  { prefix: '/admin/dashboard/students', anyOf: ['students.manage'] },

  // Administrators
  { prefix: '/admin/admins', anyOf: ['admins.manage'] },
  { prefix: '/admin/sous-admin', anyOf: ['admins.manage'] },
  { prefix: '/admin/dashboard/admins', anyOf: ['admins.manage'] },

  // Audit & history
  { prefix: '/admin/history', anyOf: HISTORY },

  // Platform settings
  { prefix: '/admin/settings', anyOf: ['platform.settings'] },
].sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Admin paths every administrator may reach regardless of module permissions:
 * their landing page, their own account, and their notifications.
 */
const UNGATED_ADMIN_PREFIXES = [
  '/admin/dashboard',
  '/admin-dashboard',
  '/admin/profile',
  '/admin/notifications',
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  return pathname.startsWith(`${prefix}/`);
}

/** Permissions gating `pathname`, or `null` when the path is not module-scoped. */
export function requiredPermissionsForPath(pathname: string): PermissionCode[] | null {
  if (UNGATED_ADMIN_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    // `/admin/dashboard/students` is gated even though `/admin/dashboard` is not.
    const nested = MODULE_RULES.find((rule) => matchesPrefix(pathname, rule.prefix));
    return nested && nested.prefix.length > '/admin/dashboard'.length ? nested.anyOf : null;
  }
  const rule = MODULE_RULES.find((candidate) => matchesPrefix(pathname, candidate.prefix));
  return rule ? rule.anyOf : null;
}

export function hasAnyPermission(user: User | null | undefined, codes: PermissionCode[]): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  const granted = user.permission_codes;
  // A session predating this field (or a non-admin role, which has no admin RBAC
  // profile) must not be locked out of the app: the API still enforces access.
  if (!Array.isArray(granted)) return true;
  return codes.some((code) => granted.includes(code));
}

/**
 * Whether `user` may open `pathname`.
 *
 * Only platform administrators are gated: staff and supervisors have no
 * AdminProfile, so `permission_codes` carries no module information for them and
 * their access is decided by the endpoints they call.
 */
export function canAccessAdminPath(user: User | null | undefined, pathname: string): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  if (normalizeRole(user.role) !== 'ADMIN') return true;

  const required = requiredPermissionsForPath(pathname);
  if (!required) return true;
  return hasAnyPermission(user, required);
}

/**
 * First admin path the user may open, used when their landing page is gated.
 * Falls back to the dashboard, which is never module-scoped.
 */
export function getFirstAccessibleAdminPath(user: User | null | undefined): string {
  return canAccessAdminPath(user, '/admin/dashboard') ? '/admin/dashboard' : '/unauthorized';
}
