import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsPendingListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="pending" />
);

export default ReportsPendingListPage;
