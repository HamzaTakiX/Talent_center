import { FunctionComponent } from 'react';
import { Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import StudentLayout from '../../components/StudentLayout';
import ReportSubmissionWorkflow from '../components/editor/ReportSubmissionWorkflow';
import ReportsAcademicWorkspace from '../components/hub/ReportsAcademicWorkspace';
import ReportsHubHero from '../components/hub/ReportsHubHero';
import ReportsHubKpiGrid from '../components/hub/ReportsHubKpiGrid';
import ReportsHubSkeletonBlock from '../components/hub/ReportsHubSkeletonBlock';
import ReportsHubTable from '../components/hub/ReportsHubTable';
import { REPORTS_HUB_WORKFLOW_SKELETON_STEPS } from '../constants/limits';
import { REPORTS_HUB_PAGE_ROOT } from '../constants/reportsHubLayout';
import { useReportsHubPlatform } from '../hooks/useReportsHubPlatform';

const ReportsHubPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { loading, report, kpis, reports, feedback, documents } = useReportsHubPlatform();
  const loadingLabel = t('student.reports.hub.loading', { defaultValue: 'Chargement…' });

  return (
    <StudentLayout>
      <div className={REPORTS_HUB_PAGE_ROOT} aria-busy={loading || undefined}>
        <ReportsHubHero report={report} kpis={kpis} loading={loading} />

        <section
          className="sr-hub__workflow-card"
          aria-label={t('student.reports.workflow.title')}
          aria-busy={loading || undefined}
        >
          <div className="sr-hub__workflow-header">
            <div className="sr-hub__workflow-title-wrap">
              <span className="sr-hub__workflow-icon" aria-hidden>
                <Workflow className="h-4 w-4" strokeWidth={2} />
              </span>
              <h2 className="sr-hub__workflow-title">{t('student.reports.workflow.title')}</h2>
            </div>
            {loading ? (
              <ReportsHubSkeletonBlock className="h-6 w-20 rounded-full" />
            ) : (
              <span className={`student-report-status-badge student-report-status-badge--${report.status}`}>
                {t(`student.reports.status.${report.status}`)}
              </span>
            )}
          </div>
          {loading ? (
            <div
              className="student-report-workflow"
              role="status"
              aria-busy="true"
              aria-label={loadingLabel}
            >
              <span className="sr-only">{loadingLabel}</span>
              {Array.from({ length: REPORTS_HUB_WORKFLOW_SKELETON_STEPS }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className="student-report-workflow-step">
                    <ReportsHubSkeletonBlock className="h-8 w-8 rounded-full" />
                    <ReportsHubSkeletonBlock className="mt-1.5 h-2.5 w-12" />
                  </div>
                  {i < REPORTS_HUB_WORKFLOW_SKELETON_STEPS - 1 ? (
                    <div className="student-report-workflow-connector" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <ReportSubmissionWorkflow status={report.status} />
          )}
        </section>

        <ReportsHubKpiGrid metrics={kpis} loading={loading} />

        <ReportsHubTable reports={reports} loading={loading} />

        <ReportsAcademicWorkspace
          reportId={report.id}
          feedback={feedback}
          documents={documents}
          loading={loading}
        />
      </div>
    </StudentLayout>
  );
};

export default ReportsHubPage;
