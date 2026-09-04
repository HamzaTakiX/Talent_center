import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../../../admin/ui';
import {
  TASKS_IN_PROGRESS_FILTER_BTN,
  TASKS_IN_PROGRESS_SEARCH_ROW,
  TASKS_IN_PROGRESS_SECTION_CARD,
  TASKS_IN_PROGRESS_STUDENT_GRID,
} from '../constants/tasksInProgressLayout';
import { tasksInProgressStudentsMock } from '../data';
import TasksInProgressStudentCard from './TasksInProgressStudentCard';

const TasksInProgressStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasksInProgressStudentsMock;
    return tasksInProgressStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.nextTaskTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={TASKS_IN_PROGRESS_SECTION_CARD} aria-label={t('encadrant.header.titles.tasksInProgress')}>
      <div className={TASKS_IN_PROGRESS_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={TASKS_IN_PROGRESS_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={TASKS_IN_PROGRESS_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <TasksInProgressStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default TasksInProgressStudentsSection;
