import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { adminFormBtnPrimaryClass } from '../../../shared/forms/adminFormClasses';

export const SRF_CONFIG_PANEL =
  'admin-module-panel rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm transition-shadow duration-300 hover:shadow-[var(--admin-shadow-md)]';

export const SRF_CONFIG_BTN_PRIMARY = `${adminFormBtnPrimaryClass} w-auto shrink-0 px-4 py-2`;

interface SrfConfigSectionShellProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const SrfConfigSectionShell: FunctionComponent<SrfConfigSectionShellProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = '',
}) => (
  <section className={`${SRF_CONFIG_PANEL} overflow-hidden p-0 ${className}`}>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_5%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_20px_color-mix(in_srgb,var(--admin-brand)_18%,transparent)] ring-1 ring-[var(--admin-brand)]/15">
          <Icon className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--admin-text)] sm:text-lg">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">{subtitle}</p>
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

interface SrfConfigSettingCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const SrfConfigSettingCard: FunctionComponent<SrfConfigSettingCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}) => (
  <article
    className={`rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_80%,var(--admin-bg-elevated))] p-4 transition-colors hover:border-[color-mix(in_srgb,var(--admin-brand)_25%,var(--admin-border))] ${className}`}
  >
    <div className="mb-3 flex items-start gap-3">
      {Icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)]">
          <Icon className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={1.75} />
        </span>
      ) : null}
      <div>
        <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--admin-text-secondary)]">{description}</p>
        ) : null}
      </div>
    </div>
    {children}
  </article>
);

export const SrfConfigPageSkeleton: FunctionComponent = () => (
  <div className="space-y-6" aria-busy>
    <div className="admin-shimmer h-36 rounded-2xl" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="admin-shimmer h-24 rounded-xl" />
      ))}
    </div>
    <div className="admin-shimmer h-64 rounded-2xl" />
    <div className="admin-shimmer h-72 rounded-2xl" />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="admin-shimmer h-80 rounded-2xl" />
      <div className="admin-shimmer h-80 rounded-2xl" />
    </div>
    <div className="admin-shimmer h-56 rounded-2xl" />
  </div>
);
