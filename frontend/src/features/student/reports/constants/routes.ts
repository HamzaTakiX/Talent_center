/** Routes — plateforme de rapports académiques étudiant. */
export const STUDENT_REPORTS_PATH = '/student/reports';
export const STUDENT_REPORTS_EDITOR_PATH = '/student/reports/editor';

export function studentReportEditorPath(reportId: string): string {
  return `${STUDENT_REPORTS_EDITOR_PATH}/${reportId}`;
}
