import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PenTool, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { STUDENT_WORKSPACE_WHITEBOARD_PATH } from '../../constants/routes';
import { workspaceCollaborators } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceWhiteboardLaunchCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const activeCount = workspaceCollaborators.filter((c) => c.isActive).length;

  return (
    <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-wb-launch`}>
      <div className="student-workspace-wb-launch__glow" aria-hidden />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="student-workspace-wb-launch__icon">
            <PenTool className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 className="m-0 text-lg font-bold tracking-tight text-[var(--admin-text)]">
              {t('student.encadrant.workspace.platform.whiteboardLaunch.title')}
            </h2>
            <p className="m-0 mt-1 max-w-xl text-sm text-[var(--admin-text-secondary)]">
              {t('student.encadrant.workspace.platform.whiteboardLaunch.subtitle')}
            </p>
            <p className="m-0 mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-brand)]">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.workspace.platform.whiteboardLaunch.active', { count: activeCount })}
            </p>
          </div>
        </div>
        <Link to={STUDENT_WORKSPACE_WHITEBOARD_PATH} className="student-workspace-wb-launch__cta">
          {t('student.encadrant.workspace.platform.whiteboardLaunch.open')}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </motion.section>
  );
};

export default WorkspaceWhiteboardLaunchCard;
