import { FunctionComponent } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaskFilters } from '../types';

interface TaskFiltersPanelProps {
  open: boolean;
  filters: TaskFilters;
  search: string;
  onFiltersChange: (patch: Partial<TaskFilters>) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

const TaskFiltersPanel: FunctionComponent<TaskFiltersPanelProps> = ({
  open,
  filters,
  search,
  onFiltersChange,
  onSearchChange,
  onReset,
}) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className={`${''} student-task-glass rounded-[12px] border border-[var(--admin-border)] p-4`}>
      <div className="relative mb-3 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('student.encadrant.task.platform.filters.search')}
          className="admin-input w-full pl-9"
        />
      </div>
      <div className="student-task-filters !p-0">
        {(['status', 'priority', 'category', 'dueRange', 'completion'] as const).map((key) => (
          <select
            key={key}
            className="admin-custom-select__trigger min-w-[8rem] text-xs"
            value={filters[key]}
            onChange={(e) => onFiltersChange({ [key]: e.target.value })}
            aria-label={
              key === 'completion'
                ? t('student.encadrant.task.platform.filters.completionLabel')
                : t(`student.encadrant.task.platform.filters.${key}`)
            }
          >
            <option value="all">{t('student.encadrant.task.platform.filters.all')}</option>
            {key === 'status' &&
              ['todo', 'in_progress', 'in_review', 'done', 'blocked'].map((v) => (
                <option key={v} value={v}>
                  {t(`student.encadrant.task.platform.status.${v}`)}
                </option>
              ))}
            {key === 'priority' &&
              ['low', 'medium', 'high', 'critical'].map((v) => (
                <option key={v} value={v}>
                  {t(`student.encadrant.task.platform.priorities.${v}`)}
                </option>
              ))}
            {key === 'category' &&
              ['internship', 'reports', 'meetings', 'documents', 'administrative', 'srf', 'personal'].map(
                (v) => (
                  <option key={v} value={v}>
                    {t(`student.encadrant.task.platform.categories.${v}`)}
                  </option>
                ),
              )}
            {key === 'dueRange' &&
              ['week', 'month', 'overdue'].map((v) => (
                <option key={v} value={v}>
                  {t(`student.encadrant.task.platform.filters.due.${v}`)}
                </option>
              ))}
            {key === 'completion' &&
              ['incomplete', 'complete'].map((v) => (
                <option key={v} value={v}>
                  {t(`student.encadrant.task.platform.filters.completionOptions.${v}`)}
                </option>
              ))}
          </select>
        ))}
        <select
          className="admin-custom-select__trigger min-w-[8rem] text-xs"
          value={filters.supervisor}
          onChange={(e) => onFiltersChange({ supervisor: e.target.value })}
        >
          <option value="all">{t('student.encadrant.task.platform.filters.all')}</option>
          <option value="bennani">Dr. Bennani</option>
          <option value="admin">{t('student.encadrant.task.platform.supervisors.admin')}</option>
          <option value="finance">{t('student.encadrant.task.platform.supervisors.finance')}</option>
        </select>
        <button type="button" className="admin-btn admin-btn-ghost admin-btn--sm" onClick={onReset}>
          {t('student.encadrant.task.platform.filters.reset')}
        </button>
      </div>
    </div>
  );
};

export default TaskFiltersPanel;
