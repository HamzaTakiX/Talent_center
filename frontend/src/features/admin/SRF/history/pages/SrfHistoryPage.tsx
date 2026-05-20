import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../main_history/config/moduleLocalHistoryConfig';

const SrfHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('srf')} />
);

export default SrfHistoryPage;
