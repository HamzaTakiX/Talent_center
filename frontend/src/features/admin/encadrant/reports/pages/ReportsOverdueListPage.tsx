import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsOverdueListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="overdue" />
);

export default ReportsOverdueListPage;
