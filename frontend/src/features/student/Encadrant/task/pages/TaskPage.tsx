import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import TaskListSection from '../components/TaskListSection';
import TaskProgressCard from '../components/TaskProgressCard';
import TaskUrgentAlert from '../components/TaskUrgentAlert';
import { TASK_PAGE_ROOT } from '../constants/taskLayout';

const TaskPage: FunctionComponent = () => (
  <StudentLayout headerTitle="Encadrant" headerSubtitle="Digital Talent Center">
    <div id="student-encadrant-task-root" className={TASK_PAGE_ROOT}>
      <TaskProgressCard />
      <TaskUrgentAlert />
      <TaskListSection />
    </div>
  </StudentLayout>
);

export default TaskPage;
