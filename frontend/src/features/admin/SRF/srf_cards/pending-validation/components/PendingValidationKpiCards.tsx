import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { pendingValidationKpis } from '../data/pendingValidationDetailMock';

const PendingValidationKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={pendingValidationKpis} />;

export default PendingValidationKpiCards;
