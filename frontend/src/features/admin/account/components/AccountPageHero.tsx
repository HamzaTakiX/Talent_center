import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';

interface AccountPageHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

const AccountPageHero: FunctionComponent<AccountPageHeroProps> = ({
  badge,
  title,
  subtitle,
  icon,
}) => (
  <motion.header
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: easePremium }}
    className="admin-account-hero relative overflow-hidden rounded-admin-xl border border-[var(--admin-border)] px-5 py-5 shadow-admin-sm sm:px-7 sm:py-6"
  >
    <div
      className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
      style={{ background: 'var(--admin-brand-muted)' }}
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -bottom-16 left-1/4 h-40 w-40 rounded-full blur-3xl"
      style={{ background: 'var(--admin-mesh-2)' }}
      aria-hidden
    />
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-medium text-[var(--admin-brand)]">
          {icon}
          <span>{badge}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{subtitle}</p>
      </div>
    </div>
  </motion.header>
);

export default AccountPageHero;
