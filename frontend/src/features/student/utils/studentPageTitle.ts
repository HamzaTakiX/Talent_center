import { STUDENT_DASHBOARD_PATH } from '../config/studentNavConfig';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bookmark,
  Briefcase,
  CalendarDays,
  CheckSquare,
  Compass,
  DollarSign,
  FilePenLine,
  FileText,
  History,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  PenLine,
  PenTool,
  Send,
  User,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';

/** i18n key under `student.header.titles.*` for the current student route. */
export const getStudentHeaderTitleKey = (pathname: string): string => {
  if (pathname === STUDENT_DASHBOARD_PATH) return 'student.header.titles.dashboard';
  if (pathname === '/student/profile') return 'student.header.titles.profile';
  if (pathname === '/cv-editor' || pathname.startsWith('/cv/')) {
    return 'student.header.titles.cvEditor';
  }
  if (pathname.includes('/cv-builder')) return 'student.header.titles.cvBuilder';
  if (pathname.includes('/cv-analysis-tool')) return 'student.header.titles.cvAnalysis';
  if (pathname.includes('/ai-career-coach')) return 'student.header.titles.aiCareerCoach';
  if (pathname.includes('/interview-simulator')) return 'student.header.titles.interviewSimulator';
  if (pathname.includes('/apply')) return 'student.header.titles.apply';
  if (pathname.match(/\/internship-offers\/[^/]+$/) && !pathname.endsWith('/all')) {
    return 'student.header.titles.offerDetails';
  }
  if (pathname === '/student/support/chat') return 'student.header.titles.supportChat';
  if (pathname === '/student/srf/chat') return 'student.header.titles.srfChat';
  if (pathname.includes('/chat')) return 'student.header.titles.chat';
  if (pathname === '/student/main-history' || pathname.includes('/history')) {
    return 'student.header.titles.history';
  }
  if (pathname.startsWith('/student/internship-offers')) {
    return 'student.header.titles.internshipOffers';
  }
  if (pathname === '/student/announcements/saved') {
    return 'student.header.titles.announcementsSaved';
  }
  if (pathname.startsWith('/student/announcements')) return 'student.header.titles.announcements';
  if (pathname.match(/\/student\/documents\/[^/]+$/) && !pathname.endsWith('/chat')) {
    return 'student.header.titles.documentDetails';
  }
  if (pathname.startsWith('/student/documents')) return 'student.header.titles.documents';
  if (pathname.startsWith('/student/srf')) return 'student.header.titles.srf';
  if (pathname.includes('/encadrant/agenda')) return 'student.header.titles.agenda';
  if (pathname.includes('/encadrant/task')) return 'student.header.titles.task';
  if (pathname.includes('/workspace/whiteboard') || pathname === '/student/workspace/whiteboard') {
    return 'student.header.titles.whiteboard';
  }
  if (pathname.includes('/encadrant/meetings')) return 'student.header.titles.meetings';
  if (pathname.includes('/encadrant/workspace')) return 'student.header.titles.workspace';
  if (pathname.includes('/encadrant/report') || pathname.startsWith('/student/reports')) {
    return 'student.header.titles.report';
  }
  if (pathname.startsWith('/student/encadrant')) return 'student.header.titles.encadrant';
  return 'student.header.defaultTitle';
};

const STUDENT_HEADER_ICONS: Record<string, LucideIcon> = {
  'student.header.titles.dashboard': LayoutDashboard,
  'student.header.titles.profile': User,
  'student.header.titles.cvEditor': PenLine,
  'student.header.titles.cvBuilder': PenLine,
  'student.header.titles.cvAnalysis': FileText,
  'student.header.titles.aiCareerCoach': Compass,
  'student.header.titles.interviewSimulator': Users,
  'student.header.titles.apply': Send,
  'student.header.titles.offerDetails': Briefcase,
  'student.header.titles.supportChat': LifeBuoy,
  'student.header.titles.srfChat': DollarSign,
  'student.header.titles.chat': MessageSquare,
  'student.header.titles.history': History,
  'student.header.titles.internshipOffers': Briefcase,
  'student.header.titles.announcementsSaved': Bookmark,
  'student.header.titles.announcements': Bell,
  'student.header.titles.documentDetails': FileText,
  'student.header.titles.documents': FileText,
  'student.header.titles.srf': DollarSign,
  'student.header.titles.agenda': CalendarDays,
  'student.header.titles.task': CheckSquare,
  'student.header.titles.whiteboard': PenTool,
  'student.header.titles.workspace': Users,
  'student.header.titles.meetings': Video,
  'student.header.titles.report': FilePenLine,
  'student.header.titles.encadrant': UserCheck,
  'student.header.defaultTitle': LayoutDashboard,
};

/** Icon shown next to the student top-bar page title. */
export const getStudentHeaderIcon = (pathname: string): LucideIcon =>
  STUDENT_HEADER_ICONS[getStudentHeaderTitleKey(pathname)] ?? LayoutDashboard;

/** i18n key under `student.header.subtitles.*` — falls back to defaultSubtitle when missing. */
export const getStudentHeaderSubtitleKey = (pathname: string): string | null => {
  if (pathname === '/student/support/chat') return 'student.header.subtitles.supportChat';
  if (pathname === '/student/srf/chat') return 'student.header.subtitles.srfChat';
  return null;
};
