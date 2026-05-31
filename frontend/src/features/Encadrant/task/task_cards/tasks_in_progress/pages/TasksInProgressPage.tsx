import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { TasksInProgressStudentsSection, TasksInProgressSummaryGrid } from '../components';
import { TASKS_IN_PROGRESS_PAGE_ROOT } from '../constants/tasksInProgressLayout';

const TasksInProgressPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Tasks In Progress" headerSubtitle="Encadrant Portal">
    <div id="encadrant-tasks-in-progress-root" className={TASKS_IN_PROGRESS_PAGE_ROOT}>
      <TasksInProgressSummaryGrid />
      <TasksInProgressStudentsSection />
    </div>
  </EncadrantLayout>
);

export default TasksInProgressPage;
