import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import TaskPageHeader from '../components/TaskPageHeader';
import TaskStatsGrid from '../components/TaskStatsGrid';
import TaskWorkspace from '../components/TaskWorkspace';
import TaskSupervisorSection from '../components/TaskSupervisorSection';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import { TASK_PAGE_ROOT } from '../constants/taskLayout';
import { useTaskPlatform } from '../hooks/useTaskPlatform';

const TaskPage: FunctionComponent = () => {
  const platform = useTaskPlatform();

  return (
    <StudentLayout>
      <div id="student-encadrant-task-root" className={TASK_PAGE_ROOT}>
        <TaskPageHeader />
        <TaskStatsGrid />

        <TaskSupervisorSection
          tasks={platform.supervisorTasks}
          onSelectTask={platform.setSelectedTaskId}
        />

        <TaskWorkspace
          viewMode={platform.viewMode}
          onViewChange={platform.setViewMode}
          tasks={platform.filteredTasks}
          loading={platform.loading}
          onSelectTask={platform.setSelectedTaskId}
          onMoveTask={platform.updateTaskStatus}
          filtersOpen={platform.filtersOpen}
          onToggleFilters={() => platform.setFiltersOpen((open) => !open)}
          activeFilterCount={platform.activeFilterCount}
          search={platform.search}
          onSearchChange={platform.setSearch}
          sort={platform.sort}
          onSortChange={platform.setSort}
          filters={platform.filters}
          onFiltersChange={(patch) => platform.setFilters((current) => ({ ...current, ...patch }))}
          onResetFilters={platform.resetFilters}
        />

        <TaskDetailDrawer
          task={platform.selectedTask}
          onClose={() => platform.setSelectedTaskId(null)}
        />
      </div>
    </StudentLayout>
  );
};

export default TaskPage;
