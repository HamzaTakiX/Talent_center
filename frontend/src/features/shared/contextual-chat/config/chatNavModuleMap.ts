import type { AdminNavSectionId } from '../../../admin/dashboard/config/adminNavConfig';
import type { StudentNavSectionId } from '../../../student/config/studentNavConfig';
import type { ChatModule } from '../types';

export interface ChatNavUnreadScope {
  module: ChatModule;
  entityType?: string;
}

/** Maps sidebar section → chat unread scope for the « Chat » child link. */
export const ADMIN_NAV_CHAT_SCOPES: Partial<Record<AdminNavSectionId, ChatNavUnreadScope>> = {
  internshipOffers: { module: 'offers' },
  announcements: { module: 'announcements' },
  documents: { module: 'documents' },
  srf: { module: 'srf' },
  encadrant: { module: 'platform', entityType: 'encadrant_desk' },
  student: { module: 'platform', entityType: 'student_admin_dm' },
  admin: { module: 'platform', entityType: 'admin_desk' },
};

export const STUDENT_NAV_CHAT_SCOPES: Partial<Record<StudentNavSectionId, ChatNavUnreadScope>> = {
  internshipOffers: { module: 'offers' },
  announcements: { module: 'announcements' },
  documents: { module: 'documents' },
  srf: { module: 'srf' },
  encadrant: { module: 'encadrant' },
  support: { module: 'platform', entityType: 'student_admin_dm' },
};

/** Encadrant portal single chat nav item (admin ↔ encadrant desk). */
export const ENCADRANT_PORTAL_CHAT_SCOPE: ChatNavUnreadScope = {
  module: 'platform',
  entityType: 'encadrant_desk',
};

export function scopeUnreadKey(module: ChatModule, entityType?: string): string {
  return entityType ? `${module}:${entityType}` : module;
}

export function resolveChatNavUnread(
  scope: ChatNavUnreadScope | undefined,
  lookup: (module: ChatModule, entityType?: string) => number,
): number {
  if (!scope) return 0;
  return lookup(scope.module, scope.entityType);
}

/** @deprecated Use ADMIN_NAV_CHAT_SCOPES + resolveChatNavUnread */
export const ADMIN_NAV_CHAT_MODULES: Partial<Record<AdminNavSectionId, ChatModule>> = {
  internshipOffers: 'offers',
  announcements: 'announcements',
  documents: 'documents',
  srf: 'srf',
  encadrant: 'platform',
  student: 'platform',
  admin: 'platform',
};

/** @deprecated Use STUDENT_NAV_CHAT_SCOPES + resolveChatNavUnread */
export const STUDENT_NAV_CHAT_MODULES: Partial<Record<StudentNavSectionId, ChatModule>> = {
  internshipOffers: 'offers',
  announcements: 'announcements',
  documents: 'documents',
  srf: 'srf',
  encadrant: 'encadrant',
  support: 'platform',
};
