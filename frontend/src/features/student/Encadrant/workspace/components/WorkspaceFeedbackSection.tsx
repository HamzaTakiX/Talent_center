import { FunctionComponent } from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceFeedback } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceFeedbackSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section
      {...fadeInUp}
      className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-feedback min-w-0`}
    >
      <div className="student-workspace-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.workspace.platform.feedback.title')}
        </h2>
      </div>
      <ul className="student-workspace-feedback__list">
        {workspaceFeedback.map((fb) => (
          <li key={fb.id}>
            <article className={`student-workspace-feedback__card student-workspace-feedback__card--${fb.status}`}>
              <div className="student-workspace-feedback__head">
                <span className="student-workspace-feedback__badge">
                  {t(`student.encadrant.workspace.platform.feedback.status.${fb.status}`)}
                </span>
                <time className="student-workspace-feedback__date" dateTime={fb.date}>
                  {fb.date}
                </time>
              </div>
              <p className="student-workspace-feedback__comment">{t(fb.commentKey)}</p>
              <a href="#" className="student-workspace-feedback__doc">
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{t(fb.documentKey)}</span>
              </a>
            </article>
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default WorkspaceFeedbackSection;
