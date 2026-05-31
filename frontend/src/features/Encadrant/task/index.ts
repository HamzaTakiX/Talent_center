export { default as EncadrantTaskPage } from './pages/TaskPage';
export { default as EncadrantCreateTaskManuallyPage } from './pages/CreateTaskManuallyPage';
export { default as EncadrantAiTaskCreationPage } from './pages/AiTaskCreationPage';
export { default as EncadrantStudentTaskDetailPage } from './pages/StudentTaskDetailPage';
export {
  ENCADRANT_TASK_PATH,
  ENCADRANT_TASK_CREATE_MANUALLY_PATH,
  ENCADRANT_TASK_AI_CREATION_PATH,
  ENCADRANT_TASK_STUDENT_DETAIL_PATH,
  getEncadrantStudentTaskDetailPath,
} from './constants/routes';
export type {
  StudentTaskDetail,
  StudentTaskItem,
  StudentTaskOverview,
  TaskSummaryStat,
} from './types';
