import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { workflowSteps } from '../../data/reportPlatformMock';
import type { ReportStatus } from '../../types';

interface ReportSubmissionWorkflowProps {
  status: ReportStatus;
}

const STATUS_ORDER: ReportStatus[] = ['draft', 'submitted', 'under_review', 'needs_revision', 'approved'];

const ReportSubmissionWorkflow: FunctionComponent<ReportSubmissionWorkflowProps> = ({ status }) => {
  const { t } = useTranslation();
  const currentIdx = STATUS_ORDER.indexOf(status === 'rejected' ? 'needs_revision' : status);

  return (
    <div className="student-report-workflow" role="list" aria-label={t('student.reports.workflow.title')}>
      {workflowSteps.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status);
        const isDone = stepIdx < currentIdx;
        const isCurrent = stepIdx === currentIdx;
        const showConnector = i < workflowSteps.length - 1;

        return (
          <div key={step.status} className="flex items-center" role="listitem">
            <div className={`student-report-workflow-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
              <div className="student-report-workflow-step__dot">{i + 1}</div>
              <span className="student-report-workflow-step__label">
                {t(`student.reports.workflow.${step.labelKey}`)}
              </span>
            </div>
            {showConnector && (
              <div className={`student-report-workflow-connector ${isDone ? 'is-done' : ''}`} aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReportSubmissionWorkflow;
