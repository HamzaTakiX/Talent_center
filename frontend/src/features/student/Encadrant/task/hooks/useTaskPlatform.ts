import { useCallback, useEffect, useMemo, useState } from 'react';

import { initialPlatformTasks } from '../data/taskPlatformMock';
import type { StudentPlatformTask, TaskFilters, TaskStatus, TaskViewMode } from '../types';
import { filterPlatformTasks } from '../utils/filterPlatformTasks';

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  supervisor: 'all',
  dueRange: 'all',
  completion: 'all',
};

export function useTaskPlatform() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<StudentPlatformTask[]>(initialPlatformTasks);
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 680);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredTasks = useMemo(
    () => filterPlatformTasks(tasks, filters, search),
    [tasks, filters, search],
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const supervisorTasks = useMemo(
    () => tasks.filter((t) => t.fromSupervisor),
    [tasks],
  );

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
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
    filtersOpen,
    setFiltersOpen,
    selectedTask,
    setSelectedTaskId,
    supervisorTasks,
    updateTaskStatus,
    resetFilters,
  };
}
