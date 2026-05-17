import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { blockedStudentsKpis } from '../data/blockedStudentsDetailMock';

const BlockedStudentsKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={blockedStudentsKpis} />;

export default BlockedStudentsKpiCards;
