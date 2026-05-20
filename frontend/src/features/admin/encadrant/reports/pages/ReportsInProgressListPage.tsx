import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsInProgressListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="in_progress" />
);

export default ReportsInProgressListPage;
