import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { partiallyPaidKpis } from '../data/partiallyPaidDetailMock';

const PartiallyPaidKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={partiallyPaidKpis} />;

export default PartiallyPaidKpiCards;
