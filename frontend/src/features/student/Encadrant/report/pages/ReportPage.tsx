import { FunctionComponent } from 'react';
import { Navigate } from 'react-router-dom';

import { STUDENT_REPORTS_PATH } from '../../../reports/constants/routes';

/** Legacy route — redirects to the Reports Hub. */
const ReportPage: FunctionComponent = () => <Navigate to={STUDENT_REPORTS_PATH} replace />;

export default ReportPage;
