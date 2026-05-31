/** Routes — module Task Encadrant. */

export { ENCADRANT_TASK_PATH } from '../../constants/routes';

export const ENCADRANT_TASK_CREATE_MANUALLY_PATH = '/encadrant/task/create-manually';
export const ENCADRANT_TASK_AI_CREATION_PATH = '/encadrant/task/ai-task-creation';

export const ENCADRANT_TASK_STUDENT_DETAIL_PATH = '/encadrant/task/students/:studentId';

export const getEncadrantStudentTaskDetailPath = (studentId: string): string =>
  `/encadrant/task/students/${studentId}`;
