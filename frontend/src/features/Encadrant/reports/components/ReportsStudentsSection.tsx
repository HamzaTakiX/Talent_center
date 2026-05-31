import { FunctionComponent, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  REPORTS_FILTER_BTN,
  REPORTS_SEARCH_INPUT,
  REPORTS_SEARCH_WRAP,
  REPORTS_SECTION_CARD,
  REPORTS_STUDENT_GRID,
  REPORTS_TOOLBAR_ROW,
} from '../constants/reportsLayout';
import { reportStudentsMock } from '../data/reportsMock';
import ReportsStudentCard from './ReportsStudentCard';

const ReportsStudentsSection: FunctionComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportStudentsMock;
    return reportStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.lastReportTitle.toLowerCase().includes(q) ||
        s.nextReportTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={REPORTS_SECTION_CARD} aria-label="Student reports overview">
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
          Student Reports Overview
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Monitor and validate student reports
        </p>
      </header>

      <div className={REPORTS_TOOLBAR_ROW}>
        <label className={REPORTS_SEARCH_WRAP}>
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
            className={REPORTS_SEARCH_INPUT}
            aria-label="Search student"
          />
        </label>
        <button type="button" className={REPORTS_FILTER_BTN} aria-label="Filter students">
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={REPORTS_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <ReportsStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default ReportsStudentsSection;
