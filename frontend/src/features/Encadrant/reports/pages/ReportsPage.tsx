import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import { ReportsStudentsSection, ReportsSummaryGrid } from '../components';
import { REPORTS_PAGE_ROOT } from '../constants/reportsLayout';

const ReportsPage: FunctionComponent = () => (
  <EncadrantLayout>
    <div id="encadrant-reports-root" className={REPORTS_PAGE_ROOT}>
      <ReportsSummaryGrid />
      <ReportsStudentsSection />
    </div>
  </EncadrantLayout>
);

export default ReportsPage;
