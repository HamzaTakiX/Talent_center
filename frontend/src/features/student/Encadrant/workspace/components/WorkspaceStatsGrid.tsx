import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Activity, FileText, LayoutGrid, StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';
import { WORKSPACE_KPI_IDS, type WorkspaceKpi, type WorkspaceKpiId } from '../types';
import { WorkspaceSkeletonBlock } from './WorkspaceSkeleton';

const icons: Record<WorkspaceKpiId, typeof FileText> = {
  boards: LayoutGrid,
  documents: FileText,
  notes: StickyNote,
  activity: Activity,
};

interface WorkspaceStatsGridProps {
  loading?: boolean;
  kpis: WorkspaceKpi[];
}

function kpiHint(t: (key: string, opts?: Record<string, unknown>) => string, kpi: WorkspaceKpi) {
  if (kpi.id === 'boards') {
    return t('student.encadrant.workspace.platform.kpi.hint.boards', {
      saved: kpi.hint.saved ?? 0,
      draft: kpi.hint.draft ?? 0,
    });
  }
  return t(`student.encadrant.workspace.platform.kpi.hint.${kpi.id}`, {
    count: kpi.hint.count ?? 0,
  });
}

const WorkspaceStatsGrid: FunctionComponent<WorkspaceStatsGridProps> = ({
  loading = false,
  kpis,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4 sm:gap-4"
        role="status"
        aria-busy="true"
        aria-label={t('student.encadrant.workspace.platform.loading', {
          defaultValue: 'Chargement…',
        })}
      >
        <span className="sr-only">
          {t('student.encadrant.workspace.platform.loading', { defaultValue: 'Chargement…' })}
        </span>
        {WORKSPACE_KPI_IDS.map((id) => (
          <div
            key={id}
            className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-kpi p-4`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <WorkspaceSkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />
                <WorkspaceSkeletonBlock className="h-3 w-20" />
              </div>
              <WorkspaceSkeletonBlock className="h-7 w-14" />
              <WorkspaceSkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
      {kpis.map((kpi, index) => {
        const Icon = icons[kpi.id];
        const piePercent = kpi.ratio ?? null;
        const title = t(`student.encadrant.workspace.platform.kpi.${kpi.id}`);
        const hint = kpiHint(t, kpi);
        const pieLabel =
          piePercent != null
            ? t(`student.encadrant.workspace.platform.kpi.share.${kpi.id}`, {
                value: piePercent,
              })
            : '';

        return (
          <motion.article
            key={kpi.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-kpi${piePercent != null ? ' student-workspace-kpi--rate' : ''}`}
          >
            <div className="student-workspace-kpi__body">
              <div className="student-workspace-kpi__top">
                <div className="student-workspace-kpi__head">
                  <span className="student-workspace-kpi__icon">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="student-workspace-kpi__title">{title}</p>
                </div>
              </div>
              <p className="m-0 text-2xl font-bold text-[var(--admin-text)]">{kpi.value}</p>
              <span className="student-workspace-kpi__badge student-workspace-kpi__badge--up">
                {hint}
              </span>
            </div>
            {piePercent != null ? (
              <div
                className="student-workspace-kpi__pie"
                style={{ '--pie-p': piePercent } as CSSProperties}
                role="img"
                aria-label={pieLabel}
              >
                <span className="student-workspace-kpi__pie-inner">{piePercent}%</span>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
};

export default WorkspaceStatsGrid;
