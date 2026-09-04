import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSIGNED_STUDENTS_GRID } from '../constants/assignedStudentsLayout';
import type { AssignedStudentListItem } from '../types';
import AssignedStudentsStudentCard from './AssignedStudentsStudentCard';

interface AssignedStudentsGridProps {
  students: AssignedStudentListItem[];
}

const AssignedStudentsGrid: FunctionComponent<AssignedStudentsGridProps> = ({ students }) => {
  const { t } = useTranslation();

  if (students.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm text-[var(--admin-text-secondary)]">
        {t('encadrant.common.emptySearch')}
      </p>
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
