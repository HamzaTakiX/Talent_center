import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../main_history/config/moduleLocalHistoryConfig';

const DocumentsHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('documents')} />
);

export default DocumentsHistoryPage;
