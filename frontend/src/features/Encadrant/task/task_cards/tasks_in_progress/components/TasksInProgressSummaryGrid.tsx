import { FunctionComponent } from 'react';
import { TASKS_IN_PROGRESS_STATS_GRID } from '../constants/tasksInProgressLayout';
import { tasksInProgressSummaryMock } from '../data';
import TasksInProgressSummaryCard from './TasksInProgressSummaryCard';

const TasksInProgressSummaryGrid: FunctionComponent = () => (
  <section aria-label="Tasks in progress summary" className={TASKS_IN_PROGRESS_STATS_GRID}>
    {tasksInProgressSummaryMock.map((stat) => (
      <TasksInProgressSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default TasksInProgressSummaryGrid;
