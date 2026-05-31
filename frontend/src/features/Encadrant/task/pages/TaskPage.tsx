import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import {
  TaskCreationGrid,
  TaskStudentOverviewSection,
  TaskSummaryGrid,
} from '../components';
import { TASK_PAGE_ROOT } from '../constants/taskLayout';

const TaskPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Task" headerSubtitle="Encadrant Portal">
    <div id="encadrant-task-root" className={TASK_PAGE_ROOT}>
      <TaskSummaryGrid />
      <TaskCreationGrid />
      <TaskStudentOverviewSection />
    </div>
  </EncadrantLayout>
);

export default TaskPage;
