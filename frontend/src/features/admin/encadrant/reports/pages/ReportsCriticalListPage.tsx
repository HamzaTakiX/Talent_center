import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsCriticalListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="critical" />
);

export default ReportsCriticalListPage;
