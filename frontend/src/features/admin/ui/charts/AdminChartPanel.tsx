import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';
import AdminChartLegend from './AdminChartLegend';
import type { AdminChartLegendItem } from './types';

interface AdminChartPanelProps {
  legend?: AdminChartLegendItem[];
  ariaLabel: string;
  children: ReactNode;
  minWidth?: string;
}

const AdminChartPanel: FunctionComponent<AdminChartPanelProps> = ({
  legend,
  ariaLabel,
  children,
  minWidth = 'min-w-[220px] sm:min-w-[360px]',
}) => (
  <motion.div
    className="admin-stat-chart space-y-2.5 sm:space-y-3"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: easePremium }}
  >
    {legend && legend.length > 0 ? <AdminChartLegend items={legend} /> : null}

    <motion.div className="admin-chart-inset overflow-x-auto overscroll-x-contain rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-2 sm:rounded-xl sm:p-3">
      <motion.div
        className={`w-full ${minWidth}`}
        role="img"
        aria-label={ariaLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easePremium }}
      >
        {children}
      </motion.div>
    </motion.div>
  </motion.div>
);

export default AdminChartPanel;
