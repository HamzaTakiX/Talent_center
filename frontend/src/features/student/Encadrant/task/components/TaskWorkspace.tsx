import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { TASK_GLASS_CARD } from '../constants/taskLayout';
import type { StudentPlatformTask, TaskViewMode } from '../types';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskListView from './TaskListView';
import TaskTimelineView from './TaskTimelineView';
import TaskCalendarView from './TaskCalendarView';

interface TaskWorkspaceProps {
  viewMode: TaskViewMode;
  tasks: StudentPlatformTask[];
  loading: boolean;
  onSelectTask: (id: string) => void;
  onMoveTask: (taskId: string, status: StudentPlatformTask['status']) => void;
}

const TaskWorkspace: FunctionComponent<TaskWorkspaceProps> = ({
  viewMode,
  tasks,
  loading,
  onSelectTask,
  onMoveTask,
}) => (
  <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass min-w-0`}>
    {viewMode === 'kanban' ? (
      <TaskKanbanBoard
        tasks={tasks}
        loading={loading}
        onSelectTask={onSelectTask}
        onMoveTask={onMoveTask}
      />
    ) : null}
    {viewMode === 'list' ? <TaskListView tasks={tasks} onSelectTask={onSelectTask} /> : null}
    {viewMode === 'timeline' ? <TaskTimelineView tasks={tasks} onSelectTask={onSelectTask} /> : null}
    {viewMode === 'calendar' ? <TaskCalendarView tasks={tasks} onSelectTask={onSelectTask} /> : null}
  </motion.section>
);

export default TaskWorkspace;
