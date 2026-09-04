import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { initialPlatformTasks } from '../data/taskPlatformMock';
import type { StudentPlatformTask, TaskFilters, TaskSortKey, TaskStatus, TaskViewMode } from '../types';
import { filterPlatformTasks } from '../utils/filterPlatformTasks';
import { sortPlatformTasks } from '../utils/sortPlatformTasks';

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  supervisor: 'all',
  dueRange: 'all',
  completion: 'all',
};

export function useTaskPlatform() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<StudentPlatformTask[]>(initialPlatformTasks);
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TaskSortKey>('dueAsc');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 680);
    return () => window.clearTimeout(timer);
  }, []);

  const translate = useCallback((key: string) => t(key), [t]);

  const filteredTasks = useMemo(
    () =>
      sortPlatformTasks(filterPlatformTasks(tasks, filters, search, translate), sort, translate),
    [tasks, filters, search, sort, translate],
  );

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const supervisorTasks = useMemo(() => tasks.filter((task) => task.fromSupervisor), [tasks]);

  const activeFilterCount = useMemo(
    () =>
      (Object.keys(filters) as (keyof TaskFilters)[]).filter((key) => filters[key] !== 'all')
        .length,
    [filters],
  );

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  return {
    loading,
    tasks,
    filteredTasks,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    search,
    setSearch,
    sort,
    setSort,
    filtersOpen,
    setFiltersOpen,
    activeFilterCount,
    selectedTask,
    setSelectedTaskId,
    supervisorTasks,
    updateTaskStatus,
    resetFilters,
  };
}
