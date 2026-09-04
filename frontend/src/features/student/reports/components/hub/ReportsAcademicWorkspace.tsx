import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import type {
  HubDocumentItem,
  HubSupervisorFeedbackItem,
} from '../../types';
import ReportsDocumentsReferences from './ReportsDocumentsReferences';
import ReportsSupervisorFeedback from './ReportsSupervisorFeedback';

interface ReportsAcademicWorkspaceProps {
  reportId: string;
  feedback: HubSupervisorFeedbackItem[];
  documents: HubDocumentItem[];
  loading?: boolean;
}

const ReportsAcademicWorkspace: FunctionComponent<ReportsAcademicWorkspaceProps> = ({
  reportId,
  feedback,
  documents,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <motion.section
      className="sr-hub-workspace"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      aria-label={t('student.reports.hub.workspaceTitle')}
      aria-busy={loading || undefined}
    >
      <div className="sr-hub-workspace__grid">
        <div className="sr-hub-workspace__feedback">
          <ReportsSupervisorFeedback items={feedback} reportId={reportId} loading={loading} />
        </div>
        <div className="sr-hub-workspace__docs">
          <ReportsDocumentsReferences items={documents} reportId={reportId} loading={loading} />
        </div>
      </div>
    </motion.section>
  );
};

export default ReportsAcademicWorkspace;
