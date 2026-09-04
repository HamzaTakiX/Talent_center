/** Routes — module Encadrant étudiant. */
export const STUDENT_ENCADRANT_PATH = '/student/encadrant';
export const STUDENT_ENCADRANT_CHAT_PATH = '/student/encadrant/chat';
export const STUDENT_ENCADRANT_MEETING_PATH = '/student/encadrant/meeting';
/** Liste des réunions (distincte de la salle Jitsi `/meeting/:sessionId`). */
export const STUDENT_ENCADRANT_MEETINGS_PATH = '/student/encadrant/meetings';
export const STUDENT_ENCADRANT_AGENDA_PATH = '/student/encadrant/agenda';
export const STUDENT_ENCADRANT_TASK_PATH = '/student/encadrant/task';
export const STUDENT_ENCADRANT_WORKSPACE_PATH = '/student/encadrant/workspace';
/** Dedicated full-screen collaborative whiteboard (Excalidraw). */
export const STUDENT_WORKSPACE_WHITEBOARD_PATH = '/student/workspace/whiteboard';
export const STUDENT_ENCADRANT_WORKSPACE_WHITEBOARD_PATH = '/student/encadrant/workspace/whiteboard';
/** Each created workspace gets its own board id so the URL can be shared. */
export const STUDENT_ENCADRANT_WORKSPACE_BOARD_PATH = '/student/encadrant/workspace/board';
export function studentWorkspaceBoardPath(boardId: string): string {
  return `${STUDENT_ENCADRANT_WORKSPACE_BOARD_PATH}/${encodeURIComponent(boardId)}`;
}
/** Legacy alias — redirects to Reports Hub via ReportPage. */
export const STUDENT_ENCADRANT_REPORT_PATH = '/student/encadrant/report';
export { STUDENT_REPORTS_PATH, studentReportEditorPath } from '../../reports/constants/routes';
