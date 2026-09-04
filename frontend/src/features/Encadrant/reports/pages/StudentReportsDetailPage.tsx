import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EncadrantLayout from '../../components/EncadrantLayout';
import ReportsDetailHeader from '../components/ReportsDetailHeader';
import ReportsDetailTable from '../components/ReportsDetailTable';
import ReportsModelGuideCard from '../components/ReportsModelGuideCard';
import { ENCADRANT_REPORTS_PATH } from '../constants/routes';
import { REPORT_DETAIL_CARD, REPORT_DETAIL_PAGE_ROOT } from '../constants/reportDetailLayout';
import { getStudentReportDetail } from '../data/reportDetailMock';

const StudentReportsDetailPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { studentId } = useParams<{ studentId: string }>();
  const detail = studentId ? getStudentReportDetail(studentId) : undefined;

  if (!detail) {
    return <Navigate to={ENCADRANT_REPORTS_PATH} replace />;
  }

  return (
    <EncadrantLayout>
      <div id="encadrant-student-reports-detail-root" className={REPORT_DETAIL_PAGE_ROOT}>
        <section
          className={REPORT_DETAIL_CARD}
          aria-label={t('encadrant.reports.detail.title', { name: detail.name })}
        >
          <ReportsDetailHeader detail={detail} />
          <ReportsDetailTable studentId={detail.studentId} rows={detail.rows} />
        </section>
        <ReportsModelGuideCard studentId={detail.studentId} studentName={detail.name} />
      </div>
    </EncadrantLayout>
  );
};

export default StudentReportsDetailPage;
