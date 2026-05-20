import { FunctionComponent } from 'react';
import SrfSubpageDetailPage from '../../../pages/SrfSubpageDetailPage';

const UnpaidStudentsDetailPage: FunctionComponent = () => (
  <SrfSubpageDetailPage subpageId="unpaid-students" chartId="srf-unpaid-amounts" showRemaining />
);

export default UnpaidStudentsDetailPage;
