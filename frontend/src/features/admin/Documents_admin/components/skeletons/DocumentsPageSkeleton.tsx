import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import AdminModulePageSkeleton from '../../../ui/AdminModulePageSkeleton';

const DocumentsPageSkeleton: FunctionComponent = () => (
  <motion.div className="admin-doc-skeleton">
    <AdminModulePageSkeleton />
    <div className="admin-doc-skeleton__kpi">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="admin-doc-skeleton__kpi-card" />
      ))}
    </div>
  </motion.div>
);

export default DocumentsPageSkeleton;
