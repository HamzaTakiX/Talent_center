import { FunctionComponent } from 'react';
import { AlertTriangle, ChevronRight, Info, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentPrecheckResult } from '../../../../api/types';
import SmartAssignmentSeverityBadge from './SmartAssignmentSeverityBadge';
import { issueTitleKey, sortIssuesBySeverity } from '../../utils/validationIssueKeys';

interface SmartAssignmentValidationBannerProps {
  precheck: SmartAssignmentPrecheckResult;
  onViewDetails: () => void;
}

const SmartAssignmentValidationBanner: FunctionComponent<SmartAssignmentValidationBannerProps> = ({
  precheck,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const sorted = sortIssuesBySeverity(precheck.issues);
  const top = sorted[0];
  const isCritical = precheck.has_blocking_errors;
  const Icon = isCritical ? ShieldAlert : top?.severity === 'warning' ? AlertTriangle : Info;
  const title = isCritical
    ? t('admin.smartAssignment.validation.banner.blockedTitle')
    : t('admin.smartAssignment.validation.banner.warningTitle');
  const subtitle = t('admin.smartAssignment.validation.banner.subtitle', {
    blocking: precheck.blocking_count,
    warnings: precheck.warning_count,
  });

  return (
    <div
      className={`mt-4 flex flex-wrap items-start gap-4 rounded-xl border p-4 shadow-sm ${
        isCritical
          ? 'border-red-500/40 bg-red-500/8'
          : 'border-amber-500/35 bg-amber-500/8'
      }`}
      role="alert"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isCritical
            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
        }`}
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-[var(--admin-text)]">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)]">{subtitle}</p>
        {top ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SmartAssignmentSeverityBadge severity={top.severity} />
            <span className="text-xs text-[var(--admin-text)]">
              {t(issueTitleKey(top.code), { count: top.count })}
            </span>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onViewDetails}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs font-medium text-[var(--admin-brand)] hover:bg-[var(--admin-surface-hover)]"
      >
        {t('admin.smartAssignment.validation.viewDetails')}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
};

export default SmartAssignmentValidationBanner;
