import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENCADRANT_TASKS_DONE_PATH } from '../task_cards/tasks_done/constants/routes';
import { ENCADRANT_TASKS_IN_PROGRESS_PATH } from '../task_cards/tasks_in_progress/constants/routes';
import { ENCADRANT_TASKS_UPCOMING_PATH } from '../task_cards/tasks_upcoming/constants/routes';
import { TASK_STATS_GRID } from '../constants/taskLayout';
import { taskSummaryMock } from '../data';
import TaskSummaryCard from './TaskSummaryCard';

const TaskSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section aria-label="Task summary" className={TASK_STATS_GRID}>
      {taskSummaryMock.map((stat) => (
        <TaskSummaryCard
          key={stat.label}
          stat={stat}
          onClick={
            stat.label === 'Tasks Done'
              ? () => navigate(ENCADRANT_TASKS_DONE_PATH)
              : stat.label === 'Tasks In Progress'
                ? () => navigate(ENCADRANT_TASKS_IN_PROGRESS_PATH)
                : stat.label === 'Tasks Upcoming'
                  ? () => navigate(ENCADRANT_TASKS_UPCOMING_PATH)
                  : undefined
          }
        />
      ))}
    </section>
  );
};

export default TaskSummaryGrid;
