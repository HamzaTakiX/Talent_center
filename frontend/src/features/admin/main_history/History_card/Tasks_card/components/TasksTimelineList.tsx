import { FunctionComponent } from 'react';
import { tasksHistoryRows } from '../data/tasksHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const TasksTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={tasksHistoryRows} />
);

export default TasksTimelineList;
