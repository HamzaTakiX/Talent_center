import { FunctionComponent } from 'react';
import { REPORTS_LATE_STATS_GRID } from '../constants/reportsLateLayout';
import { reportsLateSummaryMock } from '../data/reportsLateMock';
import ReportsLateSummaryCard from './ReportsLateSummaryCard';

const ReportsLateSummaryGrid: FunctionComponent = () => (
  <section aria-label="Reports late summary" className={REPORTS_LATE_STATS_GRID}>
    {reportsLateSummaryMock.map((stat) => (
      <ReportsLateSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default ReportsLateSummaryGrid;
