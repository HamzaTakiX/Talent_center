import { FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import AdminButton from '../../ui/AdminButton';
import { AdminTableScroll } from '../../ui';
import { AdminTableSkeletonRows } from '../../ui/AdminTableSkeleton';

export const EMAIL_SYSTEM_PANEL =
  'admin-module-panel rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] font-inter shadow-sm';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

export type EmailSystemTabLoadingVariant = 'form' | 'table' | 'metrics' | 'dual';

interface EmailSystemTabLoadingProps {
  variant?: EmailSystemTabLoadingVariant;
  tableCols?: number;
  tableRows?: number;
}

const EmailSystemPanelHeaderShimmer: FunctionComponent<{ withIcon?: boolean }> = ({ withIcon = true }) => (
  <div className="border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_5%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
    <div className="min-w-0">
      <div className="email-system-section-head__title-row">
        {withIcon ? <Shimmer className="email-system-section-head__icon shrink-0 rounded-xl" /> : null}
        <Shimmer className="h-5 w-44 max-w-full" />
      </div>
      <Shimmer className="email-system-section-head__subtitle mt-2 h-4 w-64 max-w-full" />
    </div>
  </div>
);

const EmailSystemFormBodyShimmer: FunctionComponent<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-5 p-5 sm:p-6">
    <Shimmer className="h-10 w-full max-w-xs" />
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: fields }).map((_, index) => (
        <Shimmer key={index} className="h-10 w-full" />
      ))}
    </div>
    <Shimmer className="h-10 w-36" />
  </div>
);

const EmailSystemTableBodyShimmer: FunctionComponent<{ cols: number; rows: number }> = ({ cols, rows }) => (
  <div className="admin-module-table-wrap px-4 pb-6 pt-2 lg:px-6">
    <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
      <table className="admin-table admin-table--safe w-full">
        <tbody>
          <AdminTableSkeletonRows colSpan={cols} rows={rows} />
        </tbody>
      </table>
    </AdminTableScroll>
  </div>
);

export const EmailSystemTabLoading: FunctionComponent<EmailSystemTabLoadingProps> = ({
  variant = 'form',
  tableCols = 5,
  tableRows = 6,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={variant === 'dual' ? 'email-system-tab-stack' : undefined}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('admin.modules.emailSystem.loading')}
    >
      <span className="sr-only">{t('admin.modules.emailSystem.loading')}</span>

      {variant === 'form' || variant === 'dual' ? (
        <section className={`${EMAIL_SYSTEM_PANEL} overflow-hidden`}>
          <EmailSystemPanelHeaderShimmer />
          <EmailSystemFormBodyShimmer />
        </section>
      ) : null}

      {variant === 'table' || variant === 'dual' ? (
        <div className={`${EMAIL_SYSTEM_PANEL} overflow-hidden`}>
          <div className="border-b border-[var(--admin-border)] px-5 py-4 sm:px-6">
            <Shimmer className="h-5 w-40" />
            <Shimmer className="mt-2 h-4 w-56 max-w-full" />
            {variant === 'table' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Shimmer key={index} className="h-8 w-20 rounded-lg" />
                ))}
              </div>
            ) : null}
          </div>
          <EmailSystemTableBodyShimmer cols={tableCols} rows={tableRows} />
        </div>
      ) : null}

      {variant === 'metrics' ? (
        <>
          <section className={`${EMAIL_SYSTEM_PANEL} overflow-hidden`}>
            <EmailSystemPanelHeaderShimmer />
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_80%,var(--admin-bg-elevated))] p-4"
                >
                  <Shimmer className="h-3 w-20" />
                  <Shimmer className="mt-3 h-8 w-16" />
                </div>
              ))}
            </div>
          </section>
          <div className={`${EMAIL_SYSTEM_PANEL} overflow-hidden`}>
            <div className="border-b border-[var(--admin-border)] px-5 py-4 sm:px-6">
              <Shimmer className="h-5 w-48" />
            </div>
            <EmailSystemTableBodyShimmer cols={2} rows={4} />
          </div>
        </>
      ) : null}
    </div>
  );
};

const TH = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]';
const TD = 'px-4 py-3 align-middle text-sm text-[var(--admin-text)]';

export const emailSystemTableThClass = TH;
export const emailSystemTableTdClass = TD;

interface EmailSystemSectionShellProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  busy?: boolean;
}

export const EmailSystemSectionShell: FunctionComponent<EmailSystemSectionShellProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = '',
  busy = false,
}) => (
  <section
    className={`${EMAIL_SYSTEM_PANEL} overflow-hidden ${className}`}
    aria-busy={busy}
    aria-live={busy ? 'polite' : undefined}
  >
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_5%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <div className="email-system-section-head__title-row">
          <span className="email-system-section-head__icon" aria-hidden>
            <Icon className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={1.75} />
          </span>
          <h2 className="admin-module-title text-base sm:text-lg">{title}</h2>
        </div>
        {subtitle ? (
          <p className="admin-module-subtitle email-system-section-head__subtitle max-w-2xl">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
    <div className="admin-form p-5 sm:p-6">{children}</div>
  </section>
);

interface EmailSystemTablePanelProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  minWidth?: string;
  children: ReactNode;
}

export const EmailSystemTablePanel: FunctionComponent<EmailSystemTablePanelProps> = ({
  title,
  subtitle,
  toolbar,
  minWidth = '800px',
  children,
}) => (
  <div className={`${EMAIL_SYSTEM_PANEL} overflow-hidden`}>
    <div className="border-b border-[var(--admin-border)] px-5 py-4 sm:px-6">
      <h2 className="admin-module-title text-base">{title}</h2>
      {subtitle ? <p className="admin-module-subtitle mt-1">{subtitle}</p> : null}
      {toolbar ? <div className="mt-4 flex flex-wrap items-center gap-2">{toolbar}</div> : null}
    </div>
    <div className="admin-module-table-wrap px-4 pb-6 pt-2 lg:px-6">
      <AdminTableScroll minWidth={minWidth} className="admin-table-scroll--panel">
        {children}
      </AdminTableScroll>
    </div>
  </div>
);

export function EmailSystemStatusBadge({
  tone,
  children,
}: {
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children: ReactNode;
}) {
  const map = {
    success: 'admin-badge admin-badge--success',
    warning: 'admin-badge admin-badge--warning',
    danger: 'admin-badge admin-badge--danger',
    neutral: 'admin-badge admin-badge--neutral',
    info: 'admin-badge admin-badge--info',
  };
  return <span className={map[tone]}>{children}</span>;
}

export const EmailSystemFormActions: FunctionComponent<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`flex flex-wrap items-center gap-3 border-t border-[var(--admin-border)] pt-5 ${className}`}
  >
    {children}
  </div>
);

export const EmailSystemMetricCard: FunctionComponent<{
  label: string;
  value: number | string;
}> = ({ label, value }) => (
  <article className="rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_80%,var(--admin-bg-elevated))] p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">{label}</p>
    <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
  </article>
);

export const EmailSystemAlert: FunctionComponent<{
  tone: 'success' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}> = ({ tone, children, className = '' }) => {
  const cls =
    tone === 'success'
      ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
      : tone === 'error'
        ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300'
        : 'border-[var(--admin-border)] bg-[var(--admin-brand-muted)]/30 text-[var(--admin-text-secondary)]';
  return <p className={`rounded-xl border px-4 py-3 text-sm ${cls} ${className}`}>{children}</p>;
};

export { AdminButton };
