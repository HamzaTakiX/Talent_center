import { FunctionComponent } from 'react';
import EncadrantReportFilteredLayout from '../components/EncadrantReportFilteredLayout';

const ReportsRiskAlertsListPage: FunctionComponent = () => (
  <EncadrantReportFilteredLayout filter="risk_alerts" />
);

export default ReportsRiskAlertsListPage;
