import { FunctionComponent } from 'react';
import { getModuleLocalHistoryConfig } from '../../../../admin/main_history/config/moduleLocalHistoryConfig';
import StudentModuleLocalHistoryPage from '../../../main_history/pages/StudentModuleLocalHistoryPage';

const HistoryPage: FunctionComponent = () => (
  <StudentModuleLocalHistoryPage config={getModuleLocalHistoryConfig('internshipOffers')} />
);

export default HistoryPage;
