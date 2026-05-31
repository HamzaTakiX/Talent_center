import { FunctionComponent } from 'react';
import { REPORTS_PENDING_STATS_GRID } from '../constants/reportsPendingLayout';
import { reportsPendingSummaryMock } from '../data/reportsPendingMock';
import ReportsPendingSummaryCard from './ReportsPendingSummaryCard';

const ReportsPendingSummaryGrid: FunctionComponent = () => (
  <section aria-label="Reports pending summary" className={REPORTS_PENDING_STATS_GRID}>
    {reportsPendingSummaryMock.map((stat) => (
      <ReportsPendingSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default ReportsPendingSummaryGrid;
