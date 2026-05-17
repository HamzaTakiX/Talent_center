import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../dashboard/ui/animations';

type AdminKpiGridColumns = 2 | 3 | 4 | 5;

interface AdminKpiGridProps {
  children: ReactNode;
  columns?: AdminKpiGridColumns;
  className?: string;
}

const columnClass: Record<AdminKpiGridColumns, string> = {
  2: 'admin-kpi-grid--2',
  3: 'admin-kpi-grid--3',
  4: 'admin-kpi-grid--4',
  5: 'admin-kpi-grid--5',
};

/** Grille KPI unifiée — même rendu que le panneau stats du dashboard. */
const AdminKpiGrid: FunctionComponent<AdminKpiGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => (
  <motion.section
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={`admin-kpi-panel ${className}`}
  >
    <div className={`admin-kpi-grid ${columnClass[columns]}`}>{children}</div>
  </motion.section>
);

export default AdminKpiGrid;
