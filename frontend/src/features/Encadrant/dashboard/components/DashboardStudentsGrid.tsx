import { FunctionComponent } from 'react';
import { DASHBOARD_STUDENTS_GRID } from '../constants/dashboardLayout';
import type { AssignedStudent } from '../types';
import DashboardStudentCard from './DashboardStudentCard';

interface DashboardStudentsGridProps {
  students: AssignedStudent[];
}

const DashboardStudentsGrid: FunctionComponent<DashboardStudentsGridProps> = ({ students }) => {
  if (students.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm text-[#717182]">No students match your search.</p>
    );
  }

  return (
    <div className={DASHBOARD_STUDENTS_GRID}>
      {students.map((student) => (
        <DashboardStudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};

export default DashboardStudentsGrid;
