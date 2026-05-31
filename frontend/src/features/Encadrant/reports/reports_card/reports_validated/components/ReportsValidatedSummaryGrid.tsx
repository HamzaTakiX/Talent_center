import { FunctionComponent } from 'react';
import { REPORTS_VALIDATED_STATS_GRID } from '../constants/reportsValidatedLayout';
import { reportsValidatedSummaryMock } from '../data/reportsValidatedMock';
import ReportsValidatedSummaryCard from './ReportsValidatedSummaryCard';

const ReportsValidatedSummaryGrid: FunctionComponent = () => (
  <section aria-label="Reports validated summary" className={REPORTS_VALIDATED_STATS_GRID}>
    {reportsValidatedSummaryMock.map((stat) => (
      <ReportsValidatedSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default ReportsValidatedSummaryGrid;
