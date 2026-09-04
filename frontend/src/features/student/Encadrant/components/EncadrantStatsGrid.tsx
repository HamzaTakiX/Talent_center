import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import { encadrantStats } from '../data/encadrantMock';
import EncadrantStatCard from './EncadrantStatCard';

const EncadrantStatsGrid: FunctionComponent = () => (
  <div
    id="student-encadrant-stats"
    className="admin-students-stats-grid min-w-0 !grid-cols-2 md:!grid-cols-4"
    style={
      {
        '--student-stats-glass': 'color-mix(in srgb, var(--admin-bg-elevated) 88%, transparent)',
      } as CSSProperties
    }
  >
    {encadrantStats.map((stat, index) => (
      <motion.div
        key={stat.iconKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="min-w-0"
      >
        <EncadrantStatCard stat={stat} />
      </motion.div>
    ))}
  </div>
);

export default EncadrantStatsGrid;
