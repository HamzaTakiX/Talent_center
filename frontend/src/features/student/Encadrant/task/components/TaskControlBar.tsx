import { FunctionComponent } from 'react';
import { Filter, Plus, Download, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaskViewMode } from '../types';
import { TASK_GHOST_BTN, TASK_PRIMARY_BTN } from '../constants/taskLayout';

interface TaskControlBarProps {
  viewMode: TaskViewMode;
  onViewChange: (mode: TaskViewMode) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

const VIEWS: TaskViewMode[] = ['list', 'kanban', 'timeline', 'calendar'];

const TaskControlBar: FunctionComponent<TaskControlBarProps> = ({
  viewMode,
  onViewChange,
  filtersOpen,
  onToggleFilters,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="student-task-view-tabs" role="tablist">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={viewMode === v}
            className={`student-task-view-tab ${viewMode === v ? 'is-active' : ''}`}
            onClick={() => onViewChange(v)}
          >
            {t(`student.encadrant.task.platform.views.${v}`)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={TASK_PRIMARY_BTN}>
          <Plus className="h-4 w-4" aria-hidden />
          {t('student.encadrant.task.platform.actions.create')}
        </button>
        <button
          type="button"
          className={`${TASK_GHOST_BTN} ${filtersOpen ? '!border-[var(--admin-brand)] !text-[var(--admin-brand)]' : ''}`}
          onClick={onToggleFilters}
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
          {t('student.encadrant.task.platform.actions.filter')}
        </button>
        <button type="button" className={TASK_GHOST_BTN}>
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
          {t('student.encadrant.task.platform.actions.sort')}
        </button>
        <button type="button" className={TASK_GHOST_BTN}>
          <Download className="h-3.5 w-3.5" aria-hidden />
          {t('student.encadrant.task.platform.actions.export')}
        </button>
      </div>
    </div>
  );
};

export default TaskControlBar;
