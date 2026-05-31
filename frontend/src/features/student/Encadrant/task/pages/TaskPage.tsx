import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import TaskPageHeader from '../components/TaskPageHeader';
import TaskStatsGrid from '../components/TaskStatsGrid';
import TaskProgressSection from '../components/TaskProgressSection';
import TaskPriorityAlerts from '../components/TaskPriorityAlerts';
import TaskControlBar from '../components/TaskControlBar';
import TaskFiltersPanel from '../components/TaskFiltersPanel';
import TaskWorkspace from '../components/TaskWorkspace';
import TaskDeadlinesWidget from '../components/TaskDeadlinesWidget';
import TaskSupervisorSection from '../components/TaskSupervisorSection';
import TaskMilestonesSection from '../components/TaskMilestonesSection';
import TaskNotificationsPanel from '../components/TaskNotificationsPanel';
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
        <TaskProgressSection />
        <TaskPriorityAlerts />

        <TaskControlBar
          viewMode={platform.viewMode}
          onViewChange={platform.setViewMode}
          filtersOpen={platform.filtersOpen}
          onToggleFilters={() => platform.setFiltersOpen((o) => !o)}
        />
        <TaskFiltersPanel
          open={platform.filtersOpen}
          filters={platform.filters}
          search={platform.search}
          onFiltersChange={(patch) => platform.setFilters((f) => ({ ...f, ...patch }))}
          onSearchChange={platform.setSearch}
          onReset={platform.resetFilters}
        />

        <TaskWorkspace
          viewMode={platform.viewMode}
          tasks={platform.filteredTasks}
          loading={platform.loading}
          onSelectTask={platform.setSelectedTaskId}
          onMoveTask={platform.updateTaskStatus}
        />

        <div className="student-task-two-col">
          <TaskDeadlinesWidget />
          <TaskNotificationsPanel />
        </div>

        <TaskSupervisorSection
          tasks={platform.supervisorTasks}
          onSelectTask={platform.setSelectedTaskId}
        />
        <TaskMilestonesSection />

        <TaskDetailDrawer
          task={platform.selectedTask}
          onClose={() => platform.setSelectedTaskId(null)}
        />
      </div>
    </StudentLayout>
  );
};

export default TaskPage;
