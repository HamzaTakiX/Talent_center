import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaskFilters } from '../types';

interface TaskFiltersPanelProps {
  open: boolean;
  filters: TaskFilters;
  onFiltersChange: (patch: Partial<TaskFilters>) => void;
  onReset: () => void;
}

type FilterKey = keyof TaskFilters;

interface FilterOption {
  value: string;
  labelKey: string;
}

interface FilterGroup {
  key: FilterKey;
  labelKey: string;
  options: FilterOption[];
}

const ALL: FilterOption = { value: 'all', labelKey: 'student.encadrant.task.platform.filters.all' };

const GROUPS: FilterGroup[] = [
  {
    key: 'status',
    labelKey: 'student.encadrant.task.platform.filters.status',
    options: [
      ALL,
      ...(['todo', 'in_progress', 'in_review', 'done', 'blocked'] as const).map((value) => ({
        value,
        labelKey: `student.encadrant.task.platform.status.${value}`,
      })),
    ],
  },
  {
    key: 'priority',
    labelKey: 'student.encadrant.task.platform.filters.priority',
    options: [
      ALL,
      ...(['low', 'medium', 'high', 'critical'] as const).map((value) => ({
        value,
        labelKey: `student.encadrant.task.platform.priorities.${value}`,
      })),
    ],
  },
  {
    key: 'category',
    labelKey: 'student.encadrant.task.platform.filters.category',
    options: [
      ALL,
      ...(['internship', 'reports', 'meetings', 'documents'] as const).map(
        (value) => ({
          value,
          labelKey: `student.encadrant.task.platform.categories.${value}`,
        }),
      ),
    ],
  },
  {
    key: 'dueRange',
    labelKey: 'student.encadrant.task.platform.filters.dueRange',
    options: [
      ALL,
      ...(['week', 'month', 'overdue'] as const).map((value) => ({
        value,
        labelKey: `student.encadrant.task.platform.filters.due.${value}`,
      })),
    ],
  },
  {
    key: 'completion',
    labelKey: 'student.encadrant.task.platform.filters.completionLabel',
    options: [
      ALL,
      ...(['incomplete', 'complete'] as const).map((value) => ({
        value,
        labelKey: `student.encadrant.task.platform.filters.completionOptions.${value}`,
      })),
    ],
  },
  {
    key: 'supervisor',
    labelKey: 'student.encadrant.task.platform.filters.supervisor',
    options: [
      ALL,
      { value: 'bennani', labelKey: 'student.encadrant.task.platform.supervisors.bennani' },
      { value: 'admin', labelKey: 'student.encadrant.task.platform.supervisors.admin' },
      { value: 'finance', labelKey: 'student.encadrant.task.platform.supervisors.finance' },
    ],
  },
];

const TaskFiltersPanel: FunctionComponent<TaskFiltersPanelProps> = ({
  open,
  filters,
  onFiltersChange,
  onReset,
}) => {
  const { t } = useTranslation();
  const activeCount = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key] !== 'all').length;

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="student-task-filters-panel"
    >
      <div className="student-task-filters-panel__head">
        <div className="student-task-filters-panel__title">
          <span className="student-task-filters-panel__icon">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="m-0">{t('student.encadrant.task.platform.filters.title')}</p>
          {activeCount > 0 ? (
            <span className="student-task-filters-panel__count">{activeCount}</span>
          ) : null}
        </div>
        <button
          type="button"
          className="student-task-filters-panel__reset"
          onClick={onReset}
          disabled={activeCount === 0}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t('student.encadrant.task.platform.filters.reset')}
        </button>
      </div>

      <div className="student-task-filters-panel__grid">
        {GROUPS.map((group) => (
          <div key={group.key} className="student-task-filters-panel__group">
            <p className="student-task-filters-panel__label">{t(group.labelKey)}</p>
            <div className="student-task-filters-panel__chips" role="group" aria-label={t(group.labelKey)}>
              {group.options.map((option) => {
                const active = filters[group.key] === option.value;
                return (
                  <button
                    key={`${group.key}-${option.value}`}
                    type="button"
                    className={`student-task-filter-chip ${active ? 'is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onFiltersChange({ [group.key]: option.value })}
                  >
                    {t(option.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TaskFiltersPanel;
