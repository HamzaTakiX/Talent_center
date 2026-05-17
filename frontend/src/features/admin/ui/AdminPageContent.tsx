import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../dashboard/ui/animations';

interface AdminPageContentProps {
  children: ReactNode;
  className?: string;
}

/** Conteneur standard des pages admin — espacement et largeur max alignés dashboard. */
const AdminPageContent: FunctionComponent<AdminPageContentProps> = ({
  children,
  className = '',
}) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={`admin-page ${className}`}
  >
    {children}
  </motion.div>
);

export default AdminPageContent;
