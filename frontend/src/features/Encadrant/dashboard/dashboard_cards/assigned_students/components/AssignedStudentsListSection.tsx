import { FunctionComponent, useMemo, useState } from 'react';
import { ASSIGNED_STUDENTS_SECTION_CARD } from '../constants/assignedStudentsLayout';
import { assignedStudentsListMock } from '../data';
import { filterAssignedStudents } from '../utils/filterAssignedStudents';
import AssignedStudentsGrid from './AssignedStudentsGrid';
import AssignedStudentsToolbar from './AssignedStudentsToolbar';

const AssignedStudentsListSection: FunctionComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(
    () => filterAssignedStudents(assignedStudentsListMock, searchQuery),
    [searchQuery],
  );

  return (
    <section className={ASSIGNED_STUDENTS_SECTION_CARD} aria-label="Assigned students list">
      <AssignedStudentsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <AssignedStudentsGrid students={filteredStudents} />
    </section>
  );
};

export default AssignedStudentsListSection;

