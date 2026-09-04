import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_STUDENTS_GRID } from '../constants/dashboardLayout';
import type { AssignedStudent } from '../types';
import DashboardStudentCard from './DashboardStudentCard';

interface DashboardStudentsGridProps {
  students: AssignedStudent[];
}

const DashboardStudentsGrid: FunctionComponent<DashboardStudentsGridProps> = ({ students }) => {
  const { t } = useTranslation();

  if (students.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm text-[var(--admin-text-secondary)]">
        {t('encadrant.common.emptySearch')}
      </p>
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
