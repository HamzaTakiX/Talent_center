import { STUDENT_DASHBOARD_PATH } from '../config/studentNavConfig';

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
  if (pathname.startsWith('/student/documents')) return 'student.header.titles.documents';
  if (pathname.startsWith('/student/srf')) return 'student.header.titles.srf';
  if (pathname.includes('/encadrant/agenda')) return 'student.header.titles.agenda';
  if (pathname.includes('/encadrant/task')) return 'student.header.titles.task';
  if (pathname.includes('/workspace/whiteboard') || pathname === '/student/workspace/whiteboard') {
    return 'student.header.titles.whiteboard';
  }
  if (pathname.includes('/encadrant/workspace')) return 'student.header.titles.workspace';
  if (pathname.includes('/encadrant/report') || pathname.startsWith('/student/reports')) {
    return 'student.header.titles.report';
  }
  if (pathname.startsWith('/student/encadrant')) return 'student.header.titles.encadrant';
  return 'student.header.defaultTitle';
};

/** i18n key under `student.header.subtitles.*` — falls back to defaultSubtitle when missing. */
export const getStudentHeaderSubtitleKey = (pathname: string): string | null => {
  if (pathname === '/student/srf/chat') return 'student.header.subtitles.srfChat';
  return null;
};
