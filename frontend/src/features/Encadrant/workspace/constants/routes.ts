/** Routes — module Workspace Encadrant. */

export { ENCADRANT_WORKSPACE_PATH } from '../../constants/routes';

export const ENCADRANT_WORKSPACE_STUDENT_DETAIL_PATH = '/encadrant/workspace/students/:studentId';

export const getEncadrantWorkspaceStudentDetailPath = (studentId: string): string =>
  `/encadrant/workspace/students/${studentId}`;
