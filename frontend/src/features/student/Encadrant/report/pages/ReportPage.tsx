import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import { REPORT_PAGE_ROOT } from '../constants/reportLayout';
import ReportWorkspace from '../components/ReportWorkspace';

const ReportPage: FunctionComponent = () => (
  <StudentLayout headerTitle="Encadrant" headerSubtitle="Digital Talent Center">
    <div className={REPORT_PAGE_ROOT}>
      <ReportWorkspace />
    </div>
  </StudentLayout>
);

export default ReportPage;
