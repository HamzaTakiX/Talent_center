import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENCADRANT_REPORTS_LATE_PATH } from '../reports_card/reports_late/constants/routes';
import { ENCADRANT_REPORTS_PENDING_PATH } from '../reports_card/reports_pending/constants/routes';
import { ENCADRANT_REPORTS_SUBMITTED_PATH } from '../reports_card/reports_submitted/constants/routes';
import { ENCADRANT_REPORTS_VALIDATED_PATH } from '../reports_card/reports_validated/constants/routes';
import { REPORTS_STATS_GRID } from '../constants/reportsLayout';
import { reportsSummaryMock } from '../data/reportsMock';
import ReportsSummaryCard from './ReportsSummaryCard';

const routeByLabel: Record<string, string> = {
  'Reports Submitted': ENCADRANT_REPORTS_SUBMITTED_PATH,
  'Reports Pending': ENCADRANT_REPORTS_PENDING_PATH,
  'Reports Late': ENCADRANT_REPORTS_LATE_PATH,
  'Reports Validated': ENCADRANT_REPORTS_VALIDATED_PATH,
};

const ReportsSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section aria-label="Reports summary" className={REPORTS_STATS_GRID}>
      {reportsSummaryMock.map((stat) => (
        <ReportsSummaryCard
          key={stat.label}
          stat={stat}
          onClick={() => {
            const path = routeByLabel[stat.label];
            if (path) navigate(path);
          }}
        />
      ))}
    </section>
  );
};

export default ReportsSummaryGrid;
