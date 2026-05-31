import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
  HubDocumentItem,
  HubSupervisorFeedbackItem,
  ReportActivityItem,
} from '../../types';
import ReportsDocumentsReferences from './ReportsDocumentsReferences';
import ReportsRecentActivity from './ReportsRecentActivity';
import ReportsSupervisorFeedback from './ReportsSupervisorFeedback';

interface ReportsAcademicWorkspaceProps {
  reportId: string;
  feedback: HubSupervisorFeedbackItem[];
  activity: ReportActivityItem[];
  documents: HubDocumentItem[];
}

const ReportsAcademicWorkspace: FunctionComponent<ReportsAcademicWorkspaceProps> = ({
  reportId,
  feedback,
  activity,
  documents,
}) => {
  const { t } = useTranslation();

  return (
    <motion.section
      className="sr-hub-workspace"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      aria-labelledby="sr-hub-workspace-title"
    >
      <header className="sr-hub-workspace__intro">
        <div className="sr-hub-workspace__intro-icon" aria-hidden>
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <h2 id="sr-hub-workspace-title" className="sr-hub-workspace__title">
            {t('student.reports.hub.workspaceTitle')}
          </h2>
          <p className="sr-hub-workspace__subtitle">{t('student.reports.hub.workspaceSubtitle')}</p>
        </div>
      </header>

      <div className="sr-hub-workspace__grid">
        <div className="sr-hub-workspace__feedback">
          <ReportsSupervisorFeedback items={feedback} reportId={reportId} />
        </div>
        <div className="sr-hub-workspace__activity">
          <ReportsRecentActivity items={activity} />
        </div>
        <div className="sr-hub-workspace__docs">
          <ReportsDocumentsReferences items={documents} reportId={reportId} />
        </div>
      </div>
    </motion.section>
  );
};

export default ReportsAcademicWorkspace;
