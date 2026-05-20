import { FunctionComponent } from 'react';
import SrfSubpageDetailPage from '../../../pages/SrfSubpageDetailPage';

const LatePaymentsDetailPage: FunctionComponent = () => (
  <SrfSubpageDetailPage subpageId="late-payments" chartId="srf-late-payments" showRemaining />
);

export default LatePaymentsDetailPage;
