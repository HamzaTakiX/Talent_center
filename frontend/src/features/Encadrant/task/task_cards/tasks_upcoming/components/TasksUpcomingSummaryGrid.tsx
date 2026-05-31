import { FunctionComponent } from 'react';
import { TASKS_UPCOMING_STATS_GRID } from '../constants/tasksUpcomingLayout';
import { tasksUpcomingSummaryMock } from '../data';
import TasksUpcomingSummaryCard from './TasksUpcomingSummaryCard';

const TasksUpcomingSummaryGrid: FunctionComponent = () => (
  <section aria-label="Tasks upcoming summary" className={TASKS_UPCOMING_STATS_GRID}>
    {tasksUpcomingSummaryMock.map((stat) => (
      <TasksUpcomingSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default TasksUpcomingSummaryGrid;
