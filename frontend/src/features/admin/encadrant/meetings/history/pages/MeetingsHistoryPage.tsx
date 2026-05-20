import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../../main_history/config/moduleLocalHistoryConfig';

const MeetingsHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('meetings')} />
);

export default MeetingsHistoryPage;
