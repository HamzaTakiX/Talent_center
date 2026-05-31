import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import StudentLayout from '../../components/StudentLayout';
import {
  activeHubReport,
  hubDocumentsReferences,
  hubKpiMetrics,
  hubRecentActivity,
  hubReports,
  hubSupervisorFeedback,
  reportJourneySteps,
} from '../data/reportPlatformMock';
import ReportJourneyTimeline from '../components/hub/ReportJourneyTimeline';
import ReportSubmissionWorkflow from '../components/editor/ReportSubmissionWorkflow';
import ReportsAcademicWorkspace from '../components/hub/ReportsAcademicWorkspace';
import ReportsHubHero from '../components/hub/ReportsHubHero';
import ReportsHubKpiGrid from '../components/hub/ReportsHubKpiGrid';
import ReportsHubTable from '../components/hub/ReportsHubTable';
import { studentReportEditorPath } from '../constants/routes';
import { REPORTS_HUB_PAGE_ROOT } from '../constants/reportsHubLayout';

const ReportsHubPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <StudentLayout>
      <div className={REPORTS_HUB_PAGE_ROOT}>
        <motion.header
          className="sr-hub__topbar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div>
            <h1 className="sr-hub__page-title">{t('student.reports.hub.title')}</h1>
            <p className="sr-hub__page-sub">{t('student.reports.hub.subtitle')}</p>
          </div>
          <Link
            to={studentReportEditorPath('rpt-main-2026')}
            className="sr-hub-btn sr-hub-btn--primary sr-hub-btn--sm"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('student.reports.hub.newReport')}
          </Link>
        </motion.header>

        <ReportsHubHero report={activeHubReport} kpis={hubKpiMetrics} />

        <section className="sr-hub__workflow-card" aria-label={t('student.reports.workflow.title')}>
          <div className="sr-hub__workflow-header">
            <h2 className="sr-hub__workflow-title">{t('student.reports.workflow.title')}</h2>
            <span className={`student-report-status-badge student-report-status-badge--${activeHubReport.status}`}>
              {t(`student.reports.status.${activeHubReport.status}`)}
            </span>
          </div>
          <ReportSubmissionWorkflow status={activeHubReport.status} />
        </section>

        <ReportsHubKpiGrid metrics={hubKpiMetrics} />

        <div className="sr-hub__layout">
          <div className="sr-hub__main">
            <ReportsHubTable reports={hubReports} />
          </div>
          <aside className="sr-hub__aside">
            <ReportJourneyTimeline steps={reportJourneySteps} />
          </aside>
        </div>

        <ReportsAcademicWorkspace
          reportId={activeHubReport.id}
          feedback={hubSupervisorFeedback}
          activity={hubRecentActivity}
          documents={hubDocumentsReferences}
        />
      </div>
    </StudentLayout>
  );
};

export default ReportsHubPage;
