import { FunctionComponent } from 'react';
import { tasksStats } from '../data/tasksHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const TasksStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={tasksStats} columns={4} />
);

export default TasksStatsGrid;
