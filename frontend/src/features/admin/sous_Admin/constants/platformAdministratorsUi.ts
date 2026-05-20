import type { PlatformAdminRoleVariant } from '../types/platformAdministrators';
import {
  platformAccountStatusTableBadge,
  platformAdminRoleTableBadge,
} from '../../ui/adminStatusBadges';

export const PLATFORM_ADMIN_ROLE_BADGE_CLASS: Record<PlatformAdminRoleVariant, string> = {
  super: platformAdminRoleTableBadge('super'),
  stage: platformAdminRoleTableBadge('stage'),
  finance: platformAdminRoleTableBadge('finance'),
  documents: platformAdminRoleTableBadge('documents'),
  communication: platformAdminRoleTableBadge('communication'),
  coordinator: platformAdminRoleTableBadge('coordinator'),
  academic: platformAdminRoleTableBadge('academic'),
};

export function platformRoleBadgeClass(role: PlatformAdminRoleVariant): string {
  return PLATFORM_ADMIN_ROLE_BADGE_CLASS[role] ?? platformAdminRoleTableBadge(role);
}

export function platformAdminStatusBadgeClass(status: string): string {
  return platformAccountStatusTableBadge(status);
}

export const PLATFORM_ADMIN_OUTLINE_ACTION_BTN_CLASS = 'admin-table-btn';

export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_MAIN_TABLE_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';

export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ALL_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';

export const PLATFORM_ADMIN_PRIMARY_ACTION_BTN_SUBLIST_ROLE_CLASS =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 text-num-14 font-medium leading-num-20 text-white transition-colors hover:opacity-90';
