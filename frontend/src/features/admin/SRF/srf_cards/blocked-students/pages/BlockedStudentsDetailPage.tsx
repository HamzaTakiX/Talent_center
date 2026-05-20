import { FunctionComponent } from 'react';
import SrfSubpageDetailPage from '../../../pages/SrfSubpageDetailPage';

const BlockedStudentsDetailPage: FunctionComponent = () => (
  <SrfSubpageDetailPage subpageId="blocked-students" chartId="srf-blocked-trend" />
);

export default BlockedStudentsDetailPage;
