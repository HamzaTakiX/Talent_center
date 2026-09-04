import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../../../admin/ui';
import {
  TASKS_DONE_FILTER_BTN,
  TASKS_DONE_SEARCH_ROW,
  TASKS_DONE_SECTION_CARD,
  TASKS_DONE_STUDENT_GRID,
} from '../constants/tasksDoneLayout';
import { tasksDoneStudentsMock } from '../data';
import TasksDoneStudentCard from './TasksDoneStudentCard';

const TasksDoneStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasksDoneStudentsMock;
    return tasksDoneStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.nextTaskTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={TASKS_DONE_SECTION_CARD} aria-label={t('encadrant.header.titles.tasksDone')}>
      <div className={TASKS_DONE_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={TASKS_DONE_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={TASKS_DONE_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <TasksDoneStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default TasksDoneStudentsSection;
