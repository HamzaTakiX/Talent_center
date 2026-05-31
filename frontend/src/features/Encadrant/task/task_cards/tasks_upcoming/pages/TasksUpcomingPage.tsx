import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { TasksUpcomingStudentsSection, TasksUpcomingSummaryGrid } from '../components';
import { TASKS_UPCOMING_PAGE_ROOT } from '../constants/tasksUpcomingLayout';

const TasksUpcomingPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Tasks Upcoming" headerSubtitle="Encadrant Portal">
    <div id="encadrant-tasks-upcoming-root" className={TASKS_UPCOMING_PAGE_ROOT}>
      <TasksUpcomingSummaryGrid />
      <TasksUpcomingStudentsSection />
    </div>
  </EncadrantLayout>
);

export default TasksUpcomingPage;
