import { FunctionComponent } from 'react';
import { ASSIGNED_STUDENTS_GRID } from '../constants/assignedStudentsLayout';
import type { AssignedStudentListItem } from '../types';
import AssignedStudentsStudentCard from './AssignedStudentsStudentCard';

interface AssignedStudentsGridProps {
  students: AssignedStudentListItem[];
}

const AssignedStudentsGrid: FunctionComponent<AssignedStudentsGridProps> = ({ students }) => {
  if (students.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm text-[#717182]">No students match your search.</p>
    );
  }

  return (
    <div className={ASSIGNED_STUDENTS_GRID}>
      {students.map((student) => (
        <AssignedStudentsStudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};

export default AssignedStudentsGrid;

