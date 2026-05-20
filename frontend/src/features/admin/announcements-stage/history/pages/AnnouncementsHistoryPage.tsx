import { FunctionComponent } from 'react';
import ModuleLocalHistoryPage from '../../../main_history/pages/ModuleLocalHistoryPage';
import { getModuleLocalHistoryConfig } from '../../../main_history/config/moduleLocalHistoryConfig';

const AnnouncementsHistoryPage: FunctionComponent = () => (
  <ModuleLocalHistoryPage config={getModuleLocalHistoryConfig('announcements')} />
);

export default AnnouncementsHistoryPage;
