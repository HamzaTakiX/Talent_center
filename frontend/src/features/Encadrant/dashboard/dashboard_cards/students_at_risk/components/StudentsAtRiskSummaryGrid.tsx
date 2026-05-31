import { FunctionComponent } from 'react';
import { STUDENTS_AT_RISK_STATS_GRID } from '../constants/studentsAtRiskLayout';
import { studentsAtRiskSummaryMock } from '../data';
import StudentsAtRiskSummaryCard from './StudentsAtRiskSummaryCard';

const StudentsAtRiskSummaryGrid: FunctionComponent = () => (
  <section aria-label="Students at risk summary" className={STUDENTS_AT_RISK_STATS_GRID}>
    {studentsAtRiskSummaryMock.map((stat) => (
      <StudentsAtRiskSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default StudentsAtRiskSummaryGrid;
