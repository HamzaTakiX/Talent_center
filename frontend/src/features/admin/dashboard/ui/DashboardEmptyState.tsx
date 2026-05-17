import { FunctionComponent, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from './animations';

interface DashboardEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const DashboardEmptyState: FunctionComponent<DashboardEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => (
  <motion.div
    {...fadeInUp}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center px-6 py-12 text-center"
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
      {icon ?? <Inbox className="h-6 w-6" strokeWidth={1.75} />}
    </div>
    <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[var(--admin-text-secondary)]">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default DashboardEmptyState;
