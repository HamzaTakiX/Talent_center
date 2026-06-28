import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Upload, Wallet } from 'lucide-react';
import AdminSearchEmptyState from '../../ui/AdminSearchEmptyState';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';
import { fadeInUp } from '../../dashboard/ui/animations';

const srfEmptyIcon = <Wallet className="h-7 w-7" strokeWidth={1.5} aria-hidden />;

interface SrfKpiLoadingProps {
  count?: number;
}

export const SrfKpiLoading: FunctionComponent<SrfKpiLoadingProps> = ({ count = 7 }) => (
  <AdminKpiStripSkeleton count={count} />
);

interface SrfEmptyStateProps {
  titleKey: string;
  descriptionKey: string;
  icon?: ReactNode;
  showImportAction?: boolean;
}

export const SrfEmptyState: FunctionComponent<SrfEmptyStateProps> = ({
  titleKey,
  descriptionKey,
  icon,
  showImportAction = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="admin-srf-mobile-empty">
      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.35 }}
        className="admin-srf-table-empty relative"
        role="status"
        aria-live="polite"
      >
        <span className="admin-srf-table-empty__glow" aria-hidden />
        <div className="admin-srf-table-empty__icon-wrap">{icon ?? srfEmptyIcon}</div>
        <h3 className="admin-srf-table-empty__title">{t(titleKey)}</h3>
        <p className="admin-srf-table-empty__desc">{t(descriptionKey)}</p>
        {showImportAction ? (
          <div className="admin-srf-table-empty__actions">
            <button
              type="button"
              onClick={() => navigate('/admin/srf/imports')}
              className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {t('admin.modules.srf.dashboard.empty.importData')}
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

interface SrfTableEmptyStateProps extends SrfEmptyStateProps {
  colSpan: number;
}

/** Full-width tbody empty state — no nested card, aligned with table borders. */
export const SrfTableEmptyState: FunctionComponent<SrfTableEmptyStateProps> = ({
  colSpan,
  titleKey,
  descriptionKey,
  icon,
  showImportAction = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <tr className="admin-srf-table-empty-row">
      <td colSpan={colSpan} className="admin-srf-table-empty-cell">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.35 }}
          className="admin-srf-table-empty relative"
          role="status"
          aria-live="polite"
        >
          <span className="admin-srf-table-empty__glow" aria-hidden />
          <div className="admin-srf-table-empty__icon-wrap">{icon ?? srfEmptyIcon}</div>
          <h3 className="admin-srf-table-empty__title">{t(titleKey)}</h3>
          <p className="admin-srf-table-empty__desc">{t(descriptionKey)}</p>
          {showImportAction ? (
            <div className="admin-srf-table-empty__actions">
              <button
                type="button"
                onClick={() => navigate('/admin/srf/imports')}
                className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              >
                <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {t('admin.modules.srf.dashboard.empty.importData')}
              </button>
            </div>
          ) : null}
        </motion.div>
      </td>
    </tr>
  );
};

interface SrfSearchEmptyStateProps {
  colSpan?: number;
  titleKey: string;
  descriptionKey?: string;
  variant?: 'table' | 'panel';
}

export const SrfSearchEmptyState: FunctionComponent<SrfSearchEmptyStateProps> = ({
  colSpan,
  titleKey,
  descriptionKey = 'admin.empty.tryAdjusting',
  variant = 'table',
}) => {
  if (variant === 'panel') {
    return (
      <AdminSearchEmptyState
        variant="panel"
        titleKey={titleKey}
        descriptionKey={descriptionKey}
        icon={srfEmptyIcon}
      />
    );
  }

  return (
    <tr className="admin-srf-table-empty-row">
      <td colSpan={colSpan ?? 6} className="admin-srf-table-empty-cell">
        <AdminSearchEmptyState
          variant="table"
          titleKey={titleKey}
          descriptionKey={descriptionKey}
          className="!border-0 !bg-transparent !shadow-none"
        />
      </td>
    </tr>
  );
};

interface SrfErrorStateProps {
  onRetry?: () => void;
}

export const SrfErrorState: FunctionComponent<SrfErrorStateProps> = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div
      className="admin-module-panel flex flex-col items-center gap-4 rounded-xl border border-red-200/60 bg-red-50/50 px-6 py-10 text-center dark:border-red-900/40 dark:bg-red-950/20"
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
        <AlertCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[var(--admin-text)]">
          {t('admin.srf.error.title', 'Unable to load financial data')}
        </h3>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          {t('admin.srf.error.description', 'Check your connection and try again.')}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg admin-btn-primary px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {t('admin.common.retry', 'Retry')}
        </button>
      ) : null}
    </div>
  );
};
