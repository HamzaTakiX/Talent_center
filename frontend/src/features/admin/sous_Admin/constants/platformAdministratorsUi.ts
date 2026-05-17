import type { PlatformAdminRoleVariant } from '../types/platformAdministrators';
import { platformAdminRoleTableBadge, studentAccountTableBadge } from '../../ui/adminStatusBadges';

export const PLATFORM_ADMIN_ROLE_BADGE_CLASS: Record<PlatformAdminRoleVariant, string> = {
  stage: platformAdminRoleTableBadge('stage'),
  finance: platformAdminRoleTableBadge('finance'),
  documents: platformAdminRoleTableBadge('documents'),
  communication: platformAdminRoleTableBadge('communication'),
};

export const PLATFORM_ADMIN_ACTIVE_BADGE_CLASS = studentAccountTableBadge('Active');

export const PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS = 'admin-table-btn';

/** Bouton primaire — tableau principal « Platform Administrators » (Manage Permissions). */
export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_MAIN_TABLE_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';

/** Liste « All Administrators » — bouton Permissions. */
export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ALL_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';

/** Listes filtrées par rôle — bouton Permissions. */
export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ROLE_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';
