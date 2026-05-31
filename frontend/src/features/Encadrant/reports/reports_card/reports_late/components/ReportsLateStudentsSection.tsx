import { FunctionComponent, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  REPORTS_LATE_FILTER_BTN,
  REPORTS_LATE_SEARCH_INPUT,
  REPORTS_LATE_SEARCH_ROW,
  REPORTS_LATE_SEARCH_WRAP,
  REPORTS_LATE_SECTION_CARD,
  REPORTS_LATE_STUDENT_GRID,
} from '../constants/reportsLateLayout';
import { reportsLateStudentsMock } from '../data/reportsLateMock';
import ReportsLateStudentCard from './ReportsLateStudentCard';

const ReportsLateStudentsSection: FunctionComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportsLateStudentsMock;
    return reportsLateStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.lastReportTitle.toLowerCase().includes(q) ||
        s.nextReportTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={REPORTS_LATE_SECTION_CARD} aria-label="Late student reports">
      <div className={REPORTS_LATE_SEARCH_ROW}>
        <div className={REPORTS_LATE_SEARCH_WRAP}>
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
            className={REPORTS_LATE_SEARCH_INPUT}
            aria-label="Search student"
          />
        </div>
        <button type="button" className={REPORTS_LATE_FILTER_BTN} aria-label="Filter students">
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={REPORTS_LATE_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <ReportsLateStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default ReportsLateStudentsSection;
