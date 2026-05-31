import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsLateStudentsSection, ReportsLateSummaryGrid } from '../components';
import { REPORTS_LATE_PAGE_ROOT } from '../constants/reportsLateLayout';

const ReportsLatePage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Reports Late" headerSubtitle="Encadrant Portal">
    <div id="encadrant-reports-late-root" className={REPORTS_LATE_PAGE_ROOT}>
      <ReportsLateSummaryGrid />
      <ReportsLateStudentsSection />
    </div>
  </EncadrantLayout>
);

export default ReportsLatePage;
