import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../admin/ui';
import {
  TASK_FILTER_BTN,
  TASK_SEARCH_ROW,
  TASK_SECTION_CARD,
  TASK_STUDENT_GRID,
} from '../constants/taskLayout';
import { studentTaskOverviewMock } from '../data';
import TaskStudentCard from './TaskStudentCard';

const TaskStudentOverviewSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return studentTaskOverviewMock;
    return studentTaskOverviewMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.nextTaskTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={TASK_SECTION_CARD} aria-label={t('encadrant.task.overviewAria')}>
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
          Student Task Overview
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.task.description')}
        </p>
      </header>

      <div className={TASK_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={TASK_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={TASK_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <TaskStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default TaskStudentOverviewSection;
