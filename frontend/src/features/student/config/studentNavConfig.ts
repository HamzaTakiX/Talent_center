import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  History,
  FileText,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../internship_offers/constants/routes';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../internship_offers/CV_Analyse/constants/routes';
import { STUDENT_INTERVIEW_SIMULATOR_PATH } from '../internship_offers/interview_Simulator/constants/routes';
import { STUDENT_CHAT_PATH } from '../internship_offers/chat/constants/routes';
import { STUDENT_HISTORY_PATH } from '../internship_offers/history/constants/routes';
import { STUDENT_ANNOUNCEMENTS_PATH } from '../Annoucements/constants/routes';
import { STUDENT_ANNOUNCEMENTS_CHAT_PATH } from '../Annoucements/chat/constants/routes';
import { STUDENT_ANNOUNCEMENTS_HISTORY_PATH } from '../Annoucements/history/constants/routes';
import { STUDENT_MAIN_HISTORY_PATH } from '../main_history/constants/routes';
import {
  STUDENT_DOCUMENTS_CHAT_PATH,
  STUDENT_DOCUMENTS_PATH,
} from '../Documents/constants/routes';
import {
  STUDENT_ENCADRANT_AGENDA_PATH,
  STUDENT_ENCADRANT_CHAT_PATH,
  STUDENT_ENCADRANT_PATH,
  STUDENT_ENCADRANT_REPORT_PATH,
  STUDENT_ENCADRANT_TASK_PATH,
  STUDENT_ENCADRANT_WORKSPACE_PATH,
} from '../Encadrant/constants/routes';
import { STUDENT_SRF_CHAT_PATH, STUDENT_SRF_PATH } from '../SRF/constants/routes';

export const STUDENT_DASHBOARD_PATH = '/student-dashboard';

export type StudentNavSectionId =
  | 'dashboard'
  | 'internshipOffers'
  | 'announcements'
  | 'history'
  | 'documents'
  | 'srf'
  | 'encadrant';

export type StudentNavChildId =
  | 'cvAnalysis'
  | 'interviewSimulator'
  | 'chat'
  | 'history'
  | 'agenda'
  | 'task'
  | 'workspace'
  | 'report';

export interface StudentNavItem {
  id: StudentNavSectionId;
  icon: LucideIcon;
  expandable?: boolean;
  children?: StudentNavChildId[];
  /** Section label shown immediately before this item (e.g. Resources). */
  showResourcesLabelBefore?: boolean;
}

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard },
  {
    id: 'internshipOffers',
    icon: Briefcase,
    expandable: true,
    children: ['cvAnalysis', 'interviewSimulator', 'chat', 'history'],
  },
  { id: 'announcements', icon: Bell, expandable: true, children: ['chat', 'history'] },
  { id: 'history', icon: History },
  { id: 'documents', icon: FileText, expandable: true, children: ['chat'], showResourcesLabelBefore: true },
  { id: 'srf', icon: DollarSign, expandable: true, children: ['chat'] },
  {
    id: 'encadrant',
    icon: UserCheck,
    expandable: true,
    children: ['chat', 'agenda', 'task', 'workspace', 'report'],
  },
];

export const getActiveSectionFromPath = (pathname: string): StudentNavSectionId => {
  if (pathname === STUDENT_DASHBOARD_PATH) return 'dashboard';
  if (pathname === STUDENT_MAIN_HISTORY_PATH || pathname.startsWith(`${STUDENT_MAIN_HISTORY_PATH}/`)) {
    return 'history';
  }
  if (pathname === STUDENT_INTERNSHIP_OFFERS_PATH || pathname.startsWith(`${STUDENT_INTERNSHIP_OFFERS_PATH}/`)) {
    return 'internshipOffers';
  }
  if (pathname === STUDENT_ANNOUNCEMENTS_PATH || pathname.startsWith(`${STUDENT_ANNOUNCEMENTS_PATH}/`)) {
    return 'announcements';
  }
  if (pathname === STUDENT_DOCUMENTS_PATH || pathname.startsWith(`${STUDENT_DOCUMENTS_PATH}/`)) {
    return 'documents';
  }
  if (pathname === STUDENT_SRF_PATH || pathname.startsWith(`${STUDENT_SRF_PATH}/`)) {
    return 'srf';
  }
  if (pathname === STUDENT_ENCADRANT_PATH || pathname.startsWith(`${STUDENT_ENCADRANT_PATH}/`)) {
    return 'encadrant';
  }
  return 'dashboard';
};

export const sectionToExpandForPath = (pathname: string): StudentNavSectionId | null => {
  if (pathname === STUDENT_INTERNSHIP_OFFERS_PATH || pathname.startsWith(`${STUDENT_INTERNSHIP_OFFERS_PATH}/`)) {
    return 'internshipOffers';
  }
  if (pathname === STUDENT_ANNOUNCEMENTS_PATH || pathname.startsWith(`${STUDENT_ANNOUNCEMENTS_PATH}/`)) {
    return 'announcements';
  }
  if (pathname === STUDENT_DOCUMENTS_PATH || pathname.startsWith(`${STUDENT_DOCUMENTS_PATH}/`)) {
    return 'documents';
  }
  if (pathname === STUDENT_SRF_PATH || pathname.startsWith(`${STUDENT_SRF_PATH}/`)) {
    return 'srf';
  }
  if (pathname === STUDENT_ENCADRANT_PATH || pathname.startsWith(`${STUDENT_ENCADRANT_PATH}/`)) {
    return 'encadrant';
  }
  return null;
};

export const getSectionPath = (section: StudentNavSectionId): string | undefined => {
  switch (section) {
    case 'dashboard':
      return STUDENT_DASHBOARD_PATH;
    case 'internshipOffers':
      return STUDENT_INTERNSHIP_OFFERS_PATH;
    case 'announcements':
      return STUDENT_ANNOUNCEMENTS_PATH;
    case 'history':
      return STUDENT_MAIN_HISTORY_PATH;
    case 'documents':
      return STUDENT_DOCUMENTS_PATH;
    case 'srf':
      return STUDENT_SRF_PATH;
    case 'encadrant':
      return STUDENT_ENCADRANT_PATH;
    default:
      return undefined;
  }
};

export const getChildPath = (
  section: StudentNavSectionId,
  child: StudentNavChildId,
): string | undefined => {
  if (section === 'internshipOffers') {
    if (child === 'cvAnalysis') return STUDENT_CV_ANALYSIS_TOOL_PATH;
    if (child === 'interviewSimulator') return STUDENT_INTERVIEW_SIMULATOR_PATH;
    if (child === 'chat') return STUDENT_CHAT_PATH;
    if (child === 'history') return STUDENT_HISTORY_PATH;
  }
  if (section === 'announcements') {
    if (child === 'chat') return STUDENT_ANNOUNCEMENTS_CHAT_PATH;
    if (child === 'history') return STUDENT_ANNOUNCEMENTS_HISTORY_PATH;
  }
  if (section === 'documents' && child === 'chat') return STUDENT_DOCUMENTS_CHAT_PATH;
  if (section === 'srf' && child === 'chat') return STUDENT_SRF_CHAT_PATH;
  if (section === 'encadrant') {
    if (child === 'chat') return STUDENT_ENCADRANT_CHAT_PATH;
    if (child === 'agenda') return STUDENT_ENCADRANT_AGENDA_PATH;
    if (child === 'task') return STUDENT_ENCADRANT_TASK_PATH;
    if (child === 'workspace') return STUDENT_ENCADRANT_WORKSPACE_PATH;
    if (child === 'report') return STUDENT_ENCADRANT_REPORT_PATH;
  }
  return undefined;
};

export const isChildNavActive = (
  section: StudentNavSectionId,
  child: StudentNavChildId,
  pathname: string,
): boolean => {
  const base = getChildPath(section, child);
  if (!base) return false;
  return pathname === base;
};

/** Parent section is active but not a child route (list/main page). */
export const isSectionMainActive = (section: StudentNavSectionId, pathname: string): boolean => {
  const base = getSectionPath(section);
  if (!base) return false;
  if (section === 'dashboard' || section === 'history') return pathname === base;
  return pathname === base;
};
