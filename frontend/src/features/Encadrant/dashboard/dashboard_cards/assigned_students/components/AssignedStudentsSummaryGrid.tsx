import { FunctionComponent } from 'react';
import { ASSIGNED_STUDENTS_STATS_GRID } from '../constants/assignedStudentsLayout';
import { assignedStudentsSummaryMock } from '../data';
import AssignedStudentsSummaryCard from './AssignedStudentsSummaryCard';

const AssignedStudentsSummaryGrid: FunctionComponent = () => (
  <section aria-label="Assigned students summary" className={ASSIGNED_STUDENTS_STATS_GRID}>
    {assignedStudentsSummaryMock.map((stat) => (
      <AssignedStudentsSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default AssignedStudentsSummaryGrid;

