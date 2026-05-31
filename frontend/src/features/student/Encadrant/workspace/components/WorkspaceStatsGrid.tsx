import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Activity, FileText, MessageSquare, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { workspaceKpis } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const icons = {
  collaborators: Users,
  documents: FileText,
  discussions: MessageSquare,
  reviews: ClipboardCheck,
  activity: Activity,
} as const;

const WorkspaceStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:gap-4">
      {workspaceKpis.map((kpi, i) => {
        const Icon = icons[kpi.id as keyof typeof icons];
        return (
          <motion.article
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-kpi`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="m-0 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
              {t(`student.encadrant.workspace.platform.kpi.${kpi.id}`)}
            </p>
            <p className="m-0 text-xl font-bold text-[var(--admin-text)]">{kpi.value}</p>
            {kpi.trend !== 0 ? (
              <p className="m-0 inline-flex items-center gap-1 text-xs font-semibold text-[#22c55e]">
                <TrendingUp className="h-3 w-3" aria-hidden />
                {t('student.encadrant.workspace.platform.kpi.trend', { value: Math.abs(kpi.trend) })}
              </p>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
};

export default WorkspaceStatsGrid;
