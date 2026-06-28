import { FunctionComponent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { easePremium } from '../../../../admin/dashboard/ui/animations';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: easePremium }}
        className="relative py-6"
      >
        <div className="absolute bottom-0 start-4 top-0 w-px border-s-2 border-dashed border-[var(--admin-brand)]/25" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative mb-6 ms-10 flex gap-4 opacity-30"
          >
            <span className="absolute -start-[26px] top-1 h-3 w-3 rounded-full border-2 border-[var(--admin-brand)] bg-[var(--admin-bg-elevated)]" />
            <div className="admin-shimmer h-10 flex-1 rounded-xl" />
          </div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: easePremium }}
          className="relative ms-10 rounded-2xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_4%,var(--admin-bg-elevated))] px-5 py-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_20px_color-mix(in_srgb,var(--admin-brand)_20%,transparent)]">
            <Icon className="h-6 w-6 text-[var(--admin-brand)]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-[var(--admin-text)]">{title}</p>
          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--admin-text-secondary)]">
            {description}
          </p>
          {action ? <div className="mt-4">{action}</div> : null}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easePremium }}
      className="rounded-2xl border border-[var(--admin-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--admin-brand)_5%,var(--admin-bg-elevated))] to-[var(--admin-bg-elevated)] px-6 py-7 text-center"
    >
      <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] shadow-[0_0_24px_color-mix(in_srgb,var(--admin-brand)_18%,transparent)] ring-1 ring-[var(--admin-brand)]/15">
        <Icon className="h-6 w-6 text-[var(--admin-brand)]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-[var(--admin-text)]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--admin-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </motion.div>
  );
};

export default SrfPremiumEmpty;
