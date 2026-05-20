import { FunctionComponent } from 'react';
import SrfSubpageDetailPage from '../../../pages/SrfSubpageDetailPage';

const UnpaidStudentsDetailPage: FunctionComponent = () => (
  <SrfSubpageDetailPage subpageId="unpaid-students" chartId="srf-unpaid-students" showRemaining />
);

export default UnpaidStudentsDetailPage;
