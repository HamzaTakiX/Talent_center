import { FunctionComponent, useMemo, useState } from 'react';
import { DASHBOARD_SECTION_CARD } from '../constants/dashboardLayout';
import { assignedStudentsMock } from '../data';
import { filterStudentsByQuery } from '../utils/filterStudentsByQuery';
import DashboardStudentsGrid from './DashboardStudentsGrid';
import DashboardStudentsToolbar from './DashboardStudentsToolbar';

const DashboardStudentsSection: FunctionComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(
    () => filterStudentsByQuery(assignedStudentsMock, searchQuery),
    [searchQuery],
  );

  return (
    <section className={DASHBOARD_SECTION_CARD} aria-labelledby="encadrant-my-students-title">
      <header className="flex min-w-0 flex-col gap-1">
        <h2
          id="encadrant-my-students-title"
          className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl"
        >
          My Students
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Monitor and manage your assigned students
        </p>
      </header>

      <DashboardStudentsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <DashboardStudentsGrid students={filteredStudents} />
    </section>
  );
};

export default DashboardStudentsSection;
