import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceCollaborators } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceCollaboratorsHub: FunctionComponent = () => {
  const { t } = useTranslation();
  const active = workspaceCollaborators.filter((c) => c.isActive);

  return (
    <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass`}>
      <div className="student-workspace-section-head flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.workspace.platform.collaboration.title')}
          </h2>
          <p className="m-0 mt-0.5 text-sm text-[var(--admin-text-muted)]">
            {t('student.encadrant.workspace.platform.collaboration.active', { count: active.length })}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/15 px-2.5 py-1 text-xs font-semibold text-[#4ade80]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" aria-hidden />
          {t('student.encadrant.workspace.platform.collaboration.live')}
        </span>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
        {workspaceCollaborators.map((person) => (
          <div key={person.id} className="student-workspace-collab-card">
            <div className="student-workspace-avatar">
              {person.initials}
              <span
                className={`student-workspace-presence student-workspace-presence--${person.status}`}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-[var(--admin-text)]">{t(person.nameKey)}</p>
              <p className="m-0 text-xs text-[var(--admin-text-muted)]">{t(person.roleKey)}</p>
              <p className="m-0 mt-0.5 text-[11px] font-medium text-[var(--admin-brand)]">
                {t(`student.encadrant.workspace.platform.status.${person.status}`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default WorkspaceCollaboratorsHub;
