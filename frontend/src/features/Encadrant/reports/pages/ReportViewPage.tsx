import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import EncadrantLayout from '../../components/EncadrantLayout';
import ReportViewCommentsPanel from '../components/ReportViewCommentsPanel';
import ReportViewDetailsCard from '../components/ReportViewDetailsCard';
import {
  ENCADRANT_REPORTS_PATH,
  getEncadrantReportsStudentDetailPath,
} from '../constants/routes';
import { REPORT_VIEW_GRID, REPORT_VIEW_PAGE_ROOT } from '../constants/reportViewLayout';
import { getReportView } from '../data/reportViewMock';

const ReportViewPage: FunctionComponent = () => {
  const { studentId, reportId } = useParams<{ studentId: string; reportId: string }>();
  const report =
    studentId && reportId ? getReportView(studentId, reportId) : undefined;

  if (!report || !studentId || !reportId) {
    return (
      <Navigate
        to={studentId ? getEncadrantReportsStudentDetailPath(studentId) : ENCADRANT_REPORTS_PATH}
        replace
      />
    );
  }

  return (
    <EncadrantLayout headerTitle="Reports" headerSubtitle="Encadrant Portal">
      <div id="encadrant-report-view-root" className={REPORT_VIEW_PAGE_ROOT}>
        <div className={REPORT_VIEW_GRID}>
          <ReportViewDetailsCard report={report} />
          <ReportViewCommentsPanel comments={report.comments} />
        </div>
      </div>
    </EncadrantLayout>
  );
};

export default ReportViewPage;
