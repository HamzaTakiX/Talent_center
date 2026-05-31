import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsSubmittedStudentsSection, ReportsSubmittedSummaryGrid } from '../components';
import { REPORTS_SUBMITTED_PAGE_ROOT } from '../constants/reportsSubmittedLayout';

const ReportsSubmittedPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Reports Submitted" headerSubtitle="Encadrant Portal">
    <div id="encadrant-reports-submitted-root" className={REPORTS_SUBMITTED_PAGE_ROOT}>
      <ReportsSubmittedSummaryGrid />
      <ReportsSubmittedStudentsSection />
    </div>
  </EncadrantLayout>
);

export default ReportsSubmittedPage;
