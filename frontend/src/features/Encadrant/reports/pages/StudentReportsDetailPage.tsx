import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import EncadrantLayout from '../../components/EncadrantLayout';
import ReportsDetailHeader from '../components/ReportsDetailHeader';
import ReportsDetailTable from '../components/ReportsDetailTable';
import { ENCADRANT_REPORTS_PATH } from '../constants/routes';
import { REPORT_DETAIL_CARD, REPORT_DETAIL_PAGE_ROOT } from '../constants/reportDetailLayout';
import { getStudentReportDetail } from '../data/reportDetailMock';

const StudentReportsDetailPage: FunctionComponent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const detail = studentId ? getStudentReportDetail(studentId) : undefined;

  if (!detail) {
    return <Navigate to={ENCADRANT_REPORTS_PATH} replace />;
  }

  return (
    <EncadrantLayout headerTitle="Reports" headerSubtitle="Encadrant Portal">
      <div id="encadrant-student-reports-detail-root" className={REPORT_DETAIL_PAGE_ROOT}>
        <section className={REPORT_DETAIL_CARD} aria-label={`Reports for ${detail.name}`}>
          <ReportsDetailHeader detail={detail} />
          <ReportsDetailTable studentId={detail.studentId} rows={detail.rows} />
        </section>
      </div>
    </EncadrantLayout>
  );
};

export default StudentReportsDetailPage;
