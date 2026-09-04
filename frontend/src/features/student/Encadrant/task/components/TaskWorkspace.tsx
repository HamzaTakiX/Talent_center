import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { TASK_GLASS_CARD } from '../constants/taskLayout';
import type { StudentPlatformTask, TaskFilters, TaskSortKey, TaskViewMode } from '../types';
import TaskControlBar from './TaskControlBar';
import TaskFiltersPanel from './TaskFiltersPanel';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskListView from './TaskListView';
import TaskActivityView from './TaskActivityView';
import TaskCalendarView from './TaskCalendarView';

interface TaskWorkspaceProps {
  viewMode: TaskViewMode;
  onViewChange: (mode: TaskViewMode) => void;
  tasks: StudentPlatformTask[];
  loading: boolean;
  onSelectTask: (id: string) => void;
  onMoveTask: (taskId: string, status: StudentPlatformTask['status']) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  sort: TaskSortKey;
  onSortChange: (sort: TaskSortKey) => void;
  filters: TaskFilters;
  onFiltersChange: (patch: Partial<TaskFilters>) => void;
  onResetFilters: () => void;
}

const TaskWorkspace: FunctionComponent<TaskWorkspaceProps> = ({
  viewMode,
  onViewChange,
  tasks,
  loading,
  onSelectTask,
  onMoveTask,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  search,
  onSearchChange,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  onResetFilters,
}) => (
  <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass student-task-workspace min-w-0`}>
    <div className="student-task-workspace__toolbar">
      <TaskControlBar
        viewMode={viewMode}
        onViewChange={onViewChange}
        filtersOpen={filtersOpen}
        onToggleFilters={onToggleFilters}
        activeFilterCount={activeFilterCount}
        search={search}
        onSearchChange={onSearchChange}
        sort={sort}
        onSortChange={onSortChange}
        tasks={tasks}
      />
      <TaskFiltersPanel
        open={filtersOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onReset={onResetFilters}
      />
    </div>
    {viewMode === 'kanban' ? (
      <TaskKanbanBoard
        tasks={tasks}
        loading={loading}
        onSelectTask={onSelectTask}
        onMoveTask={onMoveTask}
      />
    ) : null}
    {viewMode === 'list' ? <TaskListView tasks={tasks} onSelectTask={onSelectTask} /> : null}
    {viewMode === 'activity' ? (
      <TaskActivityView search={search} onSelectTask={onSelectTask} />
    ) : null}
    {viewMode === 'calendar' ? <TaskCalendarView tasks={tasks} onSelectTask={onSelectTask} /> : null}
  </motion.section>
);

export default TaskWorkspace;
