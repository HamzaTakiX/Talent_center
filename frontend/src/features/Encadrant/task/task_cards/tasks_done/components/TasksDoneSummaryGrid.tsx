import { FunctionComponent } from 'react';
import { TASKS_DONE_STATS_GRID } from '../constants/tasksDoneLayout';
import { tasksDoneSummaryMock } from '../data';
import TasksDoneSummaryCard from './TasksDoneSummaryCard';

const TasksDoneSummaryGrid: FunctionComponent = () => (
  <section aria-label="Tasks done summary" className={TASKS_DONE_STATS_GRID}>
    {tasksDoneSummaryMock.map((stat) => (
      <TasksDoneSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default TasksDoneSummaryGrid;
