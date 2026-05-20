import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsPendingValidationListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="pending_validation" />
);

export default ReportsPendingValidationListPage;
