import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '../dashboard/ui/animations';

interface AdminModulePanelProps {
  children: ReactNode;
  className?: string;
  /** En-tête optionnel (titre + toolbar) */
  header?: ReactNode;
}

/** Panneau module — équivalent DashboardPanel pour listes/tables/formulaires. */
const AdminModulePanel: FunctionComponent<AdminModulePanelProps> = ({
  children,
  className = '',
  header,
}) => (
  <motion.div variants={staggerItem} className={`admin-module-panel flex min-w-0 flex-col ${className}`}>
    {header}
    {children}
  </motion.div>
);

export default AdminModulePanel;
