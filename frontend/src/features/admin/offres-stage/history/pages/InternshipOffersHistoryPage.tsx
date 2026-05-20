import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../main_history/config/moduleLocalHistoryConfig';

const InternshipOffersHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('internshipOffers')} />
);

export default InternshipOffersHistoryPage;
