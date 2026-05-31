import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsValidatedStudentsSection, ReportsValidatedSummaryGrid } from '../components';
import { REPORTS_VALIDATED_PAGE_ROOT } from '../constants/reportsValidatedLayout';

const ReportsValidatedPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Reports Validated" headerSubtitle="Encadrant Portal">
    <div id="encadrant-reports-validated-root" className={REPORTS_VALIDATED_PAGE_ROOT}>
      <ReportsValidatedSummaryGrid />
      <ReportsValidatedStudentsSection />
    </div>
  </EncadrantLayout>
);

export default ReportsValidatedPage;
