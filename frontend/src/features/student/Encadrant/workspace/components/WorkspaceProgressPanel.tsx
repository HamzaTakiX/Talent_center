import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceProgress } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceProgressPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass min-w-0`}>
      <div className="student-workspace-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.workspace.platform.progress.title')}
        </h2>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {workspaceProgress.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3"
          >
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-[var(--admin-text)]">{t(m.labelKey)}</span>
              <span className="font-bold text-[var(--admin-brand)]">{m.progress}%</span>
            </div>
            <div className="student-agenda-progress-bar">
              <motion.div
                className="student-agenda-progress-bar__fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${m.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default WorkspaceProgressPanel;
