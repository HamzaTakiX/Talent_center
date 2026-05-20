import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsApprovedListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="approved" />
);

export default ReportsApprovedListPage;
