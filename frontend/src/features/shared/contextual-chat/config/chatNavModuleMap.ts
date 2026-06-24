import type { AdminNavSectionId } from '../../../admin/dashboard/config/adminNavConfig';
import type { StudentNavSectionId } from '../../../student/config/studentNavConfig';
import type { ChatModule } from '../types';

/** Maps sidebar section → contextual chat module for the « Chat » child link. */
export const ADMIN_NAV_CHAT_MODULES: Partial<Record<AdminNavSectionId, ChatModule>> = {
  internshipOffers: 'offers',
  announcements: 'announcements',
  documents: 'documents',
  srf: 'srf',
  encadrant: 'encadrant',
  student: 'platform',
  admin: 'platform',
};

export const STUDENT_NAV_CHAT_MODULES: Partial<Record<StudentNavSectionId, ChatModule>> = {
  internshipOffers: 'offers',
  announcements: 'announcements',
  documents: 'documents',
  srf: 'srf',
  encadrant: 'encadrant',
  support: 'platform',
};
