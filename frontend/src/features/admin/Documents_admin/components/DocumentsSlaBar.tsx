import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';

interface Props {
  percent: number;
  compact?: boolean;
}

const DocumentsSlaBar: FunctionComponent<Props> = ({ percent, compact }) => {
  const level = percent >= 90 ? 'critical' : percent >= 70 ? 'warning' : 'ok';
  return (
    <div className={`admin-doc-sla ${compact ? 'admin-doc-sla--compact' : ''}`} title={`${percent}%`}>
      <motion.div className="admin-doc-sla__track">
        <motion.div
          className={`admin-doc-sla__fill admin-doc-sla__fill--${level}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>
      {!compact && <span className="admin-doc-sla__label">{percent}%</span>}
    </div>
  );
};

export default DocumentsSlaBar;
