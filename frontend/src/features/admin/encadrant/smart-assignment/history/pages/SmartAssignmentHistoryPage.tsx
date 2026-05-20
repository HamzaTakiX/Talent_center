import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../../main_history/config/moduleLocalHistoryConfig';

const SmartAssignmentHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('smartAssignment')} />
);

export default SmartAssignmentHistoryPage;
