import { FunctionComponent, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerItem } from './animations';

interface DashboardPanelProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
}

const DashboardPanel: FunctionComponent<DashboardPanelProps> = ({
  children,
  interactive = false,
  className = '',
  ...motionProps
}) => (
  <motion.div
    variants={staggerItem}
    className={`admin-panel flex min-h-0 flex-col overflow-hidden text-[var(--admin-text)] ${
      interactive ? 'admin-panel-interactive cursor-pointer' : ''
    } ${className}`}
    {...motionProps}
  >
    {children}
  </motion.div>
);

export default DashboardPanel;
