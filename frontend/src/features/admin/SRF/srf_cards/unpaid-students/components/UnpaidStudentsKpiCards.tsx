import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { unpaidStudentsKpis } from '../data/unpaidStudentsDetailMock';

const UnpaidStudentsKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={unpaidStudentsKpis} />;

export default UnpaidStudentsKpiCards;
