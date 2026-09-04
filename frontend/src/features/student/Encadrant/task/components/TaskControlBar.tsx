import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Check, Download, Filter, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StudentPlatformTask, TaskSortKey, TaskViewMode } from '../types';
import { exportPlatformTasksCsv } from '../utils/exportPlatformTasks';

interface TaskControlBarProps {
  viewMode: TaskViewMode;
  onViewChange: (mode: TaskViewMode) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  sort: TaskSortKey;
  onSortChange: (sort: TaskSortKey) => void;
  tasks: StudentPlatformTask[];
}

const VIEWS: TaskViewMode[] = ['list', 'kanban', 'activity', 'calendar'];

const SORT_OPTIONS: TaskSortKey[] = ['dueAsc', 'dueDesc', 'priority', 'progress', 'title'];

const TaskControlBar: FunctionComponent<TaskControlBarProps> = ({
  viewMode,
  onViewChange,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  search,
  onSearchChange,
  sort,
  onSortChange,
  tasks,
}) => {
  const { t } = useTranslation();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [sortOpen]);

  return (
    <div className="student-task-control-bar">
      <div className="student-task-control-bar__row">
        <div className="student-task-view-tabs" role="tablist">
          {VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={viewMode === view}
              className={`student-task-view-tab ${viewMode === view ? 'is-active' : ''}`}
              onClick={() => onViewChange(view)}
            >
              {t(`student.encadrant.task.platform.views.${view}`)}
            </button>
          ))}
        </div>

        <div className="student-task-control-bar__actions">
          <button
            type="button"
            className={`student-task-tool-btn student-task-tool-btn--filter ${filtersOpen || activeFilterCount ? 'is-active' : ''}`}
            aria-expanded={filtersOpen}
            aria-pressed={filtersOpen}
            onClick={() => {
              setSortOpen(false);
              onToggleFilters();
            }}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            {t('student.encadrant.task.platform.actions.filter')}
            {activeFilterCount > 0 ? (
              <span className="student-task-tool-btn__count">{activeFilterCount}</span>
            ) : null}
          </button>

          <div className="student-task-sort" ref={sortRef}>
            <button
              type="button"
              className={`student-task-tool-btn student-task-tool-btn--sort ${sortOpen ? 'is-active' : ''}`}
              aria-expanded={sortOpen}
              aria-haspopup="menu"
              onClick={() => setSortOpen((open) => !open)}
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.task.platform.actions.sort')}
            </button>
            {sortOpen ? (
              <div className="student-task-sort__menu" role="menu">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === option}
                    className={`student-task-sort__option ${sort === option ? 'is-active' : ''}`}
                    onClick={() => {
                      onSortChange(option);
                      setSortOpen(false);
                    }}
                  >
                    {t(`student.encadrant.task.platform.sort.${option}`)}
                    {sort === option ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="student-task-tool-btn student-task-tool-btn--export"
            onClick={() => exportPlatformTasksCsv(tasks, t)}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t('student.encadrant.task.platform.actions.export')}
          </button>
        </div>
      </div>

      <label className="student-task-search">
        <Search className="student-task-search__icon" strokeWidth={2} aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('student.encadrant.task.platform.filters.search')}
          className="student-task-search__input"
          aria-label={t('student.encadrant.task.platform.filters.search')}
        />
        {search ? (
          <button
            type="button"
            className="student-task-search__clear"
            onClick={() => onSearchChange('')}
            aria-label={t('student.encadrant.task.platform.filters.reset')}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </label>
    </div>
  );
};

export default TaskControlBar;
