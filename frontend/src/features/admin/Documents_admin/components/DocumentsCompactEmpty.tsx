import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../dashboard/ui/animations';

export type DocumentsCompactEmptyTone = 'chart' | 'panel';

interface DocumentsCompactEmptyProps {
  title: string;
  description: string;
  icon: ReactNode;
  tone?: DocumentsCompactEmptyTone;
  className?: string;
}

/** Compact empty state — reduced footprint for hub charts and table panels. */
const DocumentsCompactEmpty: FunctionComponent<DocumentsCompactEmptyProps> = ({
  title,
  description,
  icon,
  tone = 'chart',
  className = '',
}) => (
  <motion.div
      {...fadeInUp}
      transition={{ duration: 0.3 }}
      className={`admin-doc-compact-empty admin-doc-compact-empty--${tone} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="admin-doc-compact-empty__icon" aria-hidden>
        {icon}
      </div>
      <p className="admin-doc-compact-empty__title">{title}</p>
      <p className="admin-doc-compact-empty__desc">{description}</p>
    </motion.div>
);

export default DocumentsCompactEmpty;
