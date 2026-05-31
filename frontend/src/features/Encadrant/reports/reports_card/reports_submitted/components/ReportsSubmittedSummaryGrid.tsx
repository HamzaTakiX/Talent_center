import { FunctionComponent } from 'react';
import { REPORTS_SUBMITTED_STATS_GRID } from '../constants/reportsSubmittedLayout';
import { reportsSubmittedSummaryMock } from '../data/reportsSubmittedMock';
import ReportsSubmittedSummaryCard from './ReportsSubmittedSummaryCard';

const ReportsSubmittedSummaryGrid: FunctionComponent = () => (
  <section aria-label="Reports submitted summary" className={REPORTS_SUBMITTED_STATS_GRID}>
    {reportsSubmittedSummaryMock.map((stat) => (
      <ReportsSubmittedSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default ReportsSubmittedSummaryGrid;
