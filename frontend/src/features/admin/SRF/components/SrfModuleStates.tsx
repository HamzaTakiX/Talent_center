import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import AdminSearchEmptyState from '../../ui/AdminSearchEmptyState';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';

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
}

export const SrfEmptyState: FunctionComponent<SrfEmptyStateProps> = ({
  titleKey,
  descriptionKey,
  icon,
}) => (
  <AdminSearchEmptyState
    variant="panel"
    titleKey={titleKey}
    descriptionKey={descriptionKey}
    icon={icon ?? <Wallet className="h-6 w-6" strokeWidth={1.75} aria-hidden />}
  />
);

interface SrfErrorStateProps {
  onRetry?: () => void;
}

export const SrfErrorState: FunctionComponent<SrfErrorStateProps> = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div
      className="admin-module-panel flex flex-col items-center gap-4 rounded-xl border border-red-200/60 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 px-6 py-10 text-center"
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
