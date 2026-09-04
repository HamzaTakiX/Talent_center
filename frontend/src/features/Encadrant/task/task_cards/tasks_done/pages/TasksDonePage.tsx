import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { TasksDoneStudentsSection, TasksDoneSummaryGrid } from '../components';
import { TASKS_DONE_PAGE_ROOT } from '../constants/tasksDoneLayout';

const TasksDonePage: FunctionComponent = () => (
  <EncadrantLayout>
    <div id="encadrant-tasks-done-root" className={TASKS_DONE_PAGE_ROOT}>
      <TasksDoneSummaryGrid />
      <TasksDoneStudentsSection />
    </div>
  </EncadrantLayout>
);

export default TasksDonePage;
