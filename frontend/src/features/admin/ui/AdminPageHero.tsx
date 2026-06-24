import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { easePremium } from '../dashboard/ui/animations';

interface AdminPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/** Hero configurable pour sous-pages admin — même langage visuel que le dashboard. */
const AdminPageHero: FunctionComponent<AdminPageHeroProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  action,
  className = '',
}) => (
  <motion.header
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: easePremium }}
    className={`admin-page-hero ${className}`}
  >
    <motion.div
      className="admin-page-hero-mesh -right-16 -top-16 h-48 w-48"
      style={{ background: 'var(--admin-brand-muted)' }}
      aria-hidden
    />
    <div
      className="admin-page-hero-mesh -bottom-12 left-1/3 h-32 w-32 opacity-40"
      style={{ background: 'var(--admin-mesh-2)' }}
      aria-hidden
    />

    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="admin-page-hero__icon" aria-hidden>
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="min-w-0">
          {badge ? <div className="mb-2">{badge}</div> : null}
          <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  </motion.header>
);

export default AdminPageHero;
