import { FunctionComponent, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  TASK_FILTER_BTN,
  TASK_SEARCH_INPUT,
  TASK_SEARCH_ROW,
  TASK_SEARCH_WRAP,
  TASK_SECTION_CARD,
  TASK_STUDENT_GRID,
} from '../constants/taskLayout';
import { studentTaskOverviewMock } from '../data';
import TaskStudentCard from './TaskStudentCard';

const TaskStudentOverviewSection: FunctionComponent = () => {
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
    <section className={TASK_SECTION_CARD} aria-label="Student task overview">
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
          Student Task Overview
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Monitor task progress for all your students
        </p>
      </header>

      <div className={TASK_SEARCH_ROW}>
        <div className={TASK_SEARCH_WRAP}>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student..."
            className={TASK_SEARCH_INPUT}
          />
        </div>
        <button type="button" className={TASK_FILTER_BTN} aria-label="Filter students">
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
