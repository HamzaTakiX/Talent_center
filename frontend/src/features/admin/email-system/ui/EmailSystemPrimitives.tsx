import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import AdminButton from '../../ui/AdminButton';
import { AdminTableScroll } from '../../ui';

export const EMAIL_SYSTEM_PANEL =
  'admin-module-panel rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] font-inter shadow-sm';

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
}

export const EmailSystemSectionShell: FunctionComponent<EmailSystemSectionShellProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = '',
}) => (
  <section className={`${EMAIL_SYSTEM_PANEL} overflow-hidden ${className}`}>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_5%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_20px_color-mix(in_srgb,var(--admin-brand)_18%,transparent)] ring-1 ring-[var(--admin-brand)]/15">
          <Icon className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="admin-module-title text-base sm:text-lg">{title}</h2>
          {subtitle ? (
            <p className="admin-module-subtitle mt-1 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
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
