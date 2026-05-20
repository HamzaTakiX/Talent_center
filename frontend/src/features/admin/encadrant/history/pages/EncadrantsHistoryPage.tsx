import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../main_history/config/moduleLocalHistoryConfig';

const EncadrantsHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('encadrants')} />
);

export default EncadrantsHistoryPage;
