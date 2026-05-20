import { STUDENT_DASHBOARD_PATH } from '../config/studentNavConfig';

/** i18n key under `student.header.titles.*` for the current student route. */
export const getStudentHeaderTitleKey = (pathname: string): string => {
  if (pathname === STUDENT_DASHBOARD_PATH) return 'student.header.titles.dashboard';
  if (pathname === '/cv-editor' || pathname.startsWith('/cv/')) {
    return 'student.header.titles.cvEditor';
  }
  if (pathname.includes('/cv-analysis-tool')) return 'student.header.titles.cvAnalysis';
  if (pathname.includes('/interview-simulator')) return 'student.header.titles.interviewSimulator';
  if (pathname.includes('/apply')) return 'student.header.titles.apply';
  if (pathname.match(/\/internship-offers\/[^/]+$/) && !pathname.endsWith('/all')) {
    return 'student.header.titles.offerDetails';
  }
  if (pathname.includes('/chat')) return 'student.header.titles.chat';
  if (pathname === '/student/main-history' || pathname.includes('/history')) {
    return 'student.header.titles.history';
  }
  if (pathname.startsWith('/student/internship-offers')) {
    return 'student.header.titles.internshipOffers';
  }
  if (pathname.startsWith('/student/announcements')) return 'student.header.titles.announcements';
  if (pathname.startsWith('/student/documents')) return 'student.header.titles.documents';
  if (pathname.startsWith('/student/srf')) return 'student.header.titles.srf';
  if (pathname.startsWith('/student/encadrant')) return 'student.header.titles.encadrant';
  return 'student.header.defaultTitle';
};
