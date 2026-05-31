import { FunctionComponent } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceKnowledge } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceKnowledgeSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section
      {...fadeInUp}
      className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-knowledge min-w-0`}
    >
      <div className="student-workspace-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.workspace.platform.knowledge.title')}
        </h2>
      </div>
      <ul className="student-workspace-knowledge__list">
        {workspaceKnowledge.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              className="student-workspace-knowledge__item"
              target={item.url?.startsWith('http') ? '_blank' : undefined}
              rel={item.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <span className="student-workspace-knowledge__icon-wrap" aria-hidden>
                <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="student-workspace-knowledge__content">
                <span className="student-workspace-knowledge__title">{t(item.titleKey)}</span>
                <span
                  className={`student-workspace-knowledge__type student-workspace-knowledge__type--${item.type}`}
                >
                  {t(`student.encadrant.workspace.platform.knowledge.types.${item.type}`)}
                </span>
              </span>
              <ExternalLink className="student-workspace-knowledge__external h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default WorkspaceKnowledgeSection;
