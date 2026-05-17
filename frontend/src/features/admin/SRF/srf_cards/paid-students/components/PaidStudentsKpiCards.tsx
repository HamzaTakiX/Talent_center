import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { paidStudentsKpis } from '../data/paidStudentsDetailMock';

const PaidStudentsKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={paidStudentsKpis} />;

export default PaidStudentsKpiCards;
