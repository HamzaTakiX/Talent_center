import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SrfPremiumEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  variant?: 'default' | 'timeline';
}

const SrfPremiumEmpty: FunctionComponent<SrfPremiumEmptyProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}) => {
  if (variant === 'timeline') {
    return (
      <div className="relative py-8">
        <div className="absolute start-4 top-0 bottom-0 w-px border-s-2 border-dashed border-[var(--admin-brand)]/25" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative mb-8 ms-10 flex gap-4 opacity-40"
            style={{ marginTop: i === 0 ? 0 : undefined }}
          >
            <span className="absolute -start-[26px] top-1 h-3 w-3 rounded-full border-2 border-[var(--admin-brand)] bg-[var(--admin-bg-elevated)]" />
            <div className="admin-shimmer h-12 flex-1 rounded-xl" />
          </div>
        ))}
        <div className="relative ms-10 rounded-2xl border border-dashed border-[var(--admin-brand)]/35 bg-[color-mix(in_srgb,var(--admin-brand)_6%,var(--admin-bg-elevated))] px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-brand-muted)] shadow-[0_0_24px_color-mix(in_srgb,var(--admin-brand)_25%,transparent)]">
            <Icon className="h-7 w-7 text-[var(--admin-brand)]" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-[var(--admin-text)]">{title}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--admin-text-secondary)]">{description}</p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-[var(--admin-brand)]/30 bg-gradient-to-br from-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] to-[var(--admin-bg-subtle)] px-6 py-10 text-center transition-colors hover:border-[var(--admin-brand)]/45">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--admin-brand-muted)] shadow-[0_0_32px_color-mix(in_srgb,var(--admin-brand)_20%,transparent)] ring-1 ring-[var(--admin-brand)]/20">
        <Icon className="h-8 w-8 text-[var(--admin-brand)]" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-[var(--admin-text)]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--admin-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default SrfPremiumEmpty;
