import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsPendingStudentsSection, ReportsPendingSummaryGrid } from '../components';
import { REPORTS_PENDING_PAGE_ROOT } from '../constants/reportsPendingLayout';

const ReportsPendingPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Reports Pending" headerSubtitle="Encadrant Portal">
    <div id="encadrant-reports-pending-root" className={REPORTS_PENDING_PAGE_ROOT}>
      <ReportsPendingSummaryGrid />
      <ReportsPendingStudentsSection />
    </div>
  </EncadrantLayout>
);

export default ReportsPendingPage;
