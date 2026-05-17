import { FunctionComponent } from 'react';
import SrfDetailKpiGrid from '../../../components/SrfDetailKpiGrid';
import { exemptedStudentsKpis } from '../data/exemptedStudentsDetailMock';

const ExemptedStudentsKpiCards: FunctionComponent = () => <SrfDetailKpiGrid items={exemptedStudentsKpis} />;

export default ExemptedStudentsKpiCards;
