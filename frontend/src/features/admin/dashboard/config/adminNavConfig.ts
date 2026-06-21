import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  History,
  FileText,
  DollarSign,
  UserCheck,
  Users,
  Shield,
} from 'lucide-react';

export type AdminNavSectionId =
  | 'dashboard'
  | 'internshipOffers'
  | 'announcements'
  | 'history'
  | 'documents'
  | 'srf'
  | 'encadrant'
  | 'student'
  | 'admin';

export type AdminNavChildId =
  | 'catalog'
  | 'chat'
  | 'drafts'
  | 'history'
  | 'reports'
  | 'meetings'
  | 'smartAssignment'
  | 'imports'
  | 'config';

export interface AdminNavItem {
  id: AdminNavSectionId;
  icon: LucideIcon;
  expandable?: boolean;
  children?: AdminNavChildId[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'internshipOffers', icon: Briefcase, expandable: true, children: ['drafts', 'chat', 'history'] },
  { id: 'announcements', icon: Bell, expandable: true, children: ['chat', 'history'] },
  { id: 'history', icon: History },
  { id: 'documents', icon: FileText, expandable: true, children: ['catalog', 'chat', 'history'] },
  { id: 'srf', icon: DollarSign, expandable: true, children: ['config', 'imports', 'chat', 'history'] },
  { id: 'encadrant', icon: UserCheck, expandable: true, children: ['chat', 'reports', 'meetings', 'smartAssignment', 'history'] },
  { id: 'student', icon: Users, expandable: true, children: ['chat'] },
  { id: 'admin', icon: Shield, expandable: true, children: ['chat'] },
];

const isAdminDashboardCardDetailPath = (pathname: string): boolean => {
  if (pathname.startsWith('/admin/dashboard/')) return true;
  return (
    pathname === '/admin/students-without-internship' ||
    pathname === '/admin/active-internship-offers' ||
    pathname === '/admin/ongoing-applications' ||
    pathname === '/admin/documents-pending-validation' ||
    pathname === '/admin/students-unpaid-srf'
  );
};

export const getActiveSectionFromPath = (pathname: string): AdminNavSectionId => {
  if (pathname === '/admin/dashboard') return 'dashboard';
  if (isAdminDashboardCardDetailPath(pathname)) return 'dashboard';
  if (pathname === '/admin/history' || pathname.startsWith('/admin/history/')) return 'history';
  if (pathname === '/admin/internship-offers' || pathname.startsWith('/admin/internship-offers/')) {
    return 'internshipOffers';
  }
  if (pathname === '/admin/announcements' || pathname.startsWith('/admin/announcements/')) {
    return 'announcements';
  }
  if (pathname === '/admin/documents' || pathname.startsWith('/admin/documents/')) {
    return 'documents';
  }
  if (pathname === '/admin/srf' || pathname.startsWith('/admin/srf/')) return 'srf';
  if (pathname.startsWith('/admin/encadrant') || pathname.startsWith('/admin/encadrants')) {
    return 'encadrant';
  }
  if (pathname.startsWith('/admin/student')) return 'student';
  if (pathname === '/admin/admins' || pathname.startsWith('/admin/admins/')) return 'admin';
  if (pathname.startsWith('/admin/sous-admin/')) return 'admin';
  return 'dashboard';
};

export const sectionToExpandForPath = (pathname: string): AdminNavSectionId | null => {
  if (isAdminDashboardCardDetailPath(pathname)) return null;
  if (pathname === '/admin/internship-offers' || pathname.startsWith('/admin/internship-offers/')) {
    return 'internshipOffers';
  }
  if (pathname === '/admin/announcements' || pathname.startsWith('/admin/announcements/')) {
    return 'announcements';
  }
  if (pathname === '/admin/documents' || pathname.startsWith('/admin/documents/')) {
    return 'documents';
  }
  if (pathname === '/admin/srf' || pathname.startsWith('/admin/srf/')) return 'srf';
  if (pathname.startsWith('/admin/encadrant') || pathname.startsWith('/admin/encadrants')) {
    return 'encadrant';
  }
  if (pathname.startsWith('/admin/student')) return 'student';
  if (pathname === '/admin/admins' || pathname.startsWith('/admin/admins/')) return 'admin';
  if (pathname.startsWith('/admin/sous-admin/')) return 'admin';
  return null;
};

export const getChildPath = (
  section: AdminNavSectionId,
  child: AdminNavChildId
): string | undefined => {
  if (section === 'internshipOffers') {
    if (child === 'drafts') return '/admin/internship-offers/drafts';
    if (child === 'chat') return '/admin/internship-offers/chat';
    if (child === 'history') return '/admin/internship-offers/history';
  }
  if (section === 'announcements') {
    if (child === 'chat') return '/admin/announcements/chat';
    if (child === 'history') return '/admin/announcements/history';
  }
  if (section === 'documents') {
    if (child === 'catalog') return '/admin/documents/catalog';
    if (child === 'chat') return '/admin/documents/chat';
    if (child === 'history') return '/admin/documents/history';
  }
  if (section === 'srf' && child === 'config') return '/admin/srf/config';
  if (section === 'srf' && child === 'imports') return '/admin/srf/imports';
  if (section === 'srf' && child === 'chat') return '/admin/srf/chat';
  if (section === 'srf' && child === 'history') return '/admin/srf/history';
  if (section === 'encadrant' && child === 'history') return '/admin/encadrants/history';
  if (section === 'encadrant' && child === 'chat') return '/admin/encadrant/chat';
  if (section === 'encadrant' && child === 'reports') return '/admin/encadrant/reports';
  if (section === 'encadrant' && child === 'meetings') return '/admin/encadrant/meetings';
  if (section === 'encadrant' && child === 'smartAssignment') {
    return '/admin/encadrant/smart-assignment';
  }
  if (section === 'student' && child === 'chat') return '/admin/student/chat';
  if (section === 'admin' && child === 'chat') return '/admin/sous-admin/chat';
  return undefined;
};

/** Whether a sidebar child link should appear active (includes sub-routes e.g. catalog/create). */
export const isChildNavActive = (
  section: AdminNavSectionId,
  child: AdminNavChildId,
  pathname: string,
): boolean => {
  const base = getChildPath(section, child);
  if (!base) return false;
  if (section === 'documents' && child === 'catalog') {
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  return pathname === base;
};

export const getSectionPath = (section: AdminNavSectionId): string | undefined => {
  switch (section) {
    case 'dashboard':
      return '/admin/dashboard';
    case 'internshipOffers':
      return '/admin/internship-offers';
    case 'announcements':
      return '/admin/announcements';
    case 'history':
      return '/admin/history';
    case 'documents':
      return '/admin/documents';
    case 'srf':
      return '/admin/srf';
    case 'encadrant':
      return '/admin/encadrants';
    case 'student':
      return '/admin/students';
    case 'admin':
      return '/admin/admins';
    default:
      return undefined;
  }
};
