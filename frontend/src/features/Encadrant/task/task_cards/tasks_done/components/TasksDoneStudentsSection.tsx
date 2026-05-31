import { FunctionComponent, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  TASKS_DONE_FILTER_BTN,
  TASKS_DONE_SEARCH_INPUT,
  TASKS_DONE_SEARCH_ROW,
  TASKS_DONE_SEARCH_WRAP,
  TASKS_DONE_SECTION_CARD,
  TASKS_DONE_STUDENT_GRID,
} from '../constants/tasksDoneLayout';
import { tasksDoneStudentsMock } from '../data';
import TasksDoneStudentCard from './TasksDoneStudentCard';

const TasksDoneStudentsSection: FunctionComponent = () => {
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
    <section className={TASKS_DONE_SECTION_CARD} aria-label="Students with done tasks">
      <div className={TASKS_DONE_SEARCH_ROW}>
        <div className={TASKS_DONE_SEARCH_WRAP}>
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
            className={TASKS_DONE_SEARCH_INPUT}
          />
        </div>
        <button type="button" className={TASKS_DONE_FILTER_BTN} aria-label="Filter students">
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
