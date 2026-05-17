import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { latePaymentsKpis } from '../data/latePaymentsDetailMock';

const LatePaymentsKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={latePaymentsKpis} />;

export default LatePaymentsKpiCards;
