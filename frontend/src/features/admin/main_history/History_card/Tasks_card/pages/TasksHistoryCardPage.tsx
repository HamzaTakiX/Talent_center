import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import TasksStatsGrid from '../components/TasksStatsGrid';
import TasksTimelineList from '../components/TasksTimelineList';

const TasksHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<TasksStatsGrid />} timeline={<TasksTimelineList />} />
);

export default TasksHistoryCardPage;
