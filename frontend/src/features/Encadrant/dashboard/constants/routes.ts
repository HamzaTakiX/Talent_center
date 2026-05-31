/** Routes — module Dashboard Encadrant. */

export { ENCADRANT_PATH } from '../../constants/routes';

export const ENCADRANT_STUDENTS_PATH = '/encadrant/students';

export const getEncadrantStudentDetailPath = (studentId: string): string =>
  `${ENCADRANT_STUDENTS_PATH}/${studentId}`;
