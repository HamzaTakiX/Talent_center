/** Routes — module Reports Encadrant. */

export { ENCADRANT_REPORTS_PATH } from '../../constants/routes';

export const ENCADRANT_REPORTS_STUDENT_DETAIL_PATH = '/encadrant/reports/students/:studentId';

export const getEncadrantReportsStudentDetailPath = (studentId: string): string =>
  `/encadrant/reports/students/${studentId}`;

export const ENCADRANT_REPORT_VIEW_PATH =
  '/encadrant/reports/students/:studentId/reports/:reportId';

export const getEncadrantReportViewPath = (studentId: string, reportId: string): string =>
  `/encadrant/reports/students/${studentId}/reports/${reportId}`;
