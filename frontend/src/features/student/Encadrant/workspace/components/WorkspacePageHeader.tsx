import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, Share2, Sparkles, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { WORKSPACE_GHOST_BTN, WORKSPACE_PRIMARY_BTN } from '../constants/workspaceLayout';

const WorkspacePageHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="student-workspace-hero student-workspace-glass"
    >
      <span
        className="student-workspace-hero__glow -right-12 -top-12 h-40 w-40"
        style={{ background: 'var(--admin-brand-muted)' }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] text-[var(--admin-brand)]">
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-brand)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.workspace.platform.badge')}
            </div>
            <h1 className="m-0 text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
              {t('student.encadrant.workspace.platform.title')}
            </h1>
            <p className="m-0 mt-1 max-w-2xl text-sm text-[var(--admin-text-secondary)]">
              {t('student.encadrant.workspace.platform.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button type="button" className={WORKSPACE_PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('student.encadrant.workspace.platform.actions.createNote')}</span>
          </button>
          <button type="button" className={WORKSPACE_GHOST_BTN}>
            <Video className="h-3.5 w-3.5" aria-hidden />
            {t('student.encadrant.workspace.platform.actions.meeting')}
          </button>
          <button type="button" className={WORKSPACE_GHOST_BTN}>
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            {t('student.encadrant.workspace.platform.actions.share')}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default WorkspacePageHeader;
