import { FunctionComponent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { adminFormBtnPrimaryClass } from '../../../shared/forms/adminFormClasses';
import { easePremium } from '../../../dashboard/ui/animations';

export const SRF_CONFIG_PANEL =
  'admin-module-panel rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm';

export const SRF_CONFIG_BTN_PRIMARY = `${adminFormBtnPrimaryClass} w-auto shrink-0 px-4 py-2`;

// ─── Section Shell ───────────────────────────────────────────────────────────

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
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: easePremium }}
    className={`${SRF_CONFIG_PANEL} overflow-hidden p-0 transition-shadow duration-300 hover:shadow-[var(--admin-shadow-md)] ${className}`}
  >
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_4%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_20px_color-mix(in_srgb,var(--admin-brand)_15%,transparent)] ring-1 ring-[var(--admin-brand)]/15">
          <Icon className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--admin-text)] sm:text-lg">{title}</h2>
          <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">{subtitle}</p>
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
    <div className="p-5 sm:p-6">{children}</div>
  </motion.section>
);

// ─── Setting Card ─────────────────────────────────────────────────────────────

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
    className={`rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_80%,var(--admin-bg-elevated))] p-4 transition-all duration-200 hover:border-[color-mix(in_srgb,var(--admin-brand)_28%,var(--admin-border))] hover:shadow-sm ${className}`}
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

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const SkeletonSectionHeader: FunctionComponent<{ hasAction?: boolean }> = ({ hasAction = true }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_4%,var(--admin-bg-elevated))] px-5 py-4 sm:px-6">
    <div className="flex items-center gap-3">
      <div className="admin-shimmer h-11 w-11 shrink-0 rounded-xl" />
      <div className="space-y-2">
        <div className="admin-shimmer h-5 w-44 rounded-lg" />
        <div className="admin-shimmer h-3 w-72 rounded-full" />
      </div>
    </div>
    {hasAction ? <div className="admin-shimmer hidden h-9 w-28 shrink-0 rounded-xl sm:block" /> : null}
  </div>
);

// ─── Page-level skeleton ──────────────────────────────────────────────────────

export const SrfConfigPageSkeleton: FunctionComponent = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="space-y-5"
    aria-busy
    aria-label="Loading SRF configuration"
  >
    {/* ── Hero skeleton ─────────────────────────────────── */}
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-6 py-5 shadow-sm sm:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="admin-shimmer h-14 w-14 shrink-0 rounded-2xl" />
          <div className="space-y-2.5 pt-0.5">
            <div className="admin-shimmer h-3 w-28 rounded-full" />
            <div className="admin-shimmer h-7 w-72 rounded-xl" />
            <div className="admin-shimmer h-3 w-80 rounded-full" />
            <div className="admin-shimmer h-3 w-56 rounded-full opacity-60" />
          </div>
        </div>
        <div className="admin-shimmer h-7 w-44 shrink-0 rounded-full" />
      </div>
    </div>

    {/* ── Analytics strip skeleton ───────────────────────── */}
    <div className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-r border-[var(--admin-border)] p-4 last:border-r-0"
          >
            <div className="admin-shimmer h-10 w-10 shrink-0 rounded-xl" />
            <div className="space-y-1.5">
              <div className="admin-shimmer h-6 w-10 rounded" />
              <div className="admin-shimmer h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── Config overview cards skeleton ────────────────── */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="admin-shimmer h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="admin-shimmer h-4 w-24 rounded-lg" />
              <div className="admin-shimmer h-3 w-16 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="admin-shimmer h-3 w-full rounded-full" />
            <div className="admin-shimmer h-3 w-3/4 rounded-full" />
          </div>
          <div className="admin-shimmer mt-4 h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>

    {/* ── Exam Planning skeleton ─────────────────────────── */}
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
      <SkeletonSectionHeader />
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
        <div className="admin-shimmer h-48 rounded-xl" />
        <div className="admin-shimmer h-48 rounded-xl" />
      </div>
    </div>

    {/* ── Warning Tiers skeleton ─────────────────────────── */}
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
      <SkeletonSectionHeader hasAction={false} />
      <div className="space-y-3 p-5 sm:p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="admin-shimmer h-20 rounded-xl" />
        ))}
        <div className="admin-shimmer mt-3 h-36 rounded-xl" />
      </div>
    </div>

    {/* ── Restrictions + Simulation skeleton ────────────── */}
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
        <SkeletonSectionHeader hasAction={false} />
        <div className="space-y-2 p-5 sm:p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-shimmer h-11 rounded-xl" />
          ))}
          <div className="admin-shimmer mt-2 h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
        <SkeletonSectionHeader hasAction={false} />
        <div className="space-y-4 p-5 sm:p-6">
          <div className="admin-shimmer h-28 rounded-xl" />
          <div className="space-y-2">
            <div className="admin-shimmer h-4 w-40 rounded-full" />
            <div className="admin-shimmer h-4 w-52 rounded-full" />
            <div className="admin-shimmer h-4 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* ── Templates skeleton ─────────────────────────────── */}
    <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-sm">
      <SkeletonSectionHeader hasAction={false} />
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
        <div className="admin-shimmer h-56 rounded-xl" />
        <div className="admin-shimmer h-56 rounded-xl" />
      </div>
    </div>
  </motion.div>
);
