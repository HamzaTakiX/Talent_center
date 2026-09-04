import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { easePremium } from '../../../dashboard/ui/animations';

export interface DocumentsOverviewStatItem {
  label: string;
  value: string;
  badge: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  piePercent?: number;
}

interface DocumentsOverviewStatGridProps {
  items: DocumentsOverviewStatItem[];
}

const DocumentsOverviewStatGrid: FunctionComponent<DocumentsOverviewStatGridProps> = ({ items }) => (
  <div className="admin-students-stats-grid">
    {items.map((stat, index) => (
      <motion.article
        key={stat.label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`admin-students-stat-card${stat.piePercent != null ? ' admin-students-stat-card--rate' : ''}`}
        style={
          {
            '--student-stat-accent': stat.accent,
            '--student-stat-accent-bg': stat.accentBg,
          } as CSSProperties
        }
      >
        <div className="admin-students-stat-card__body">
          <div className="admin-students-stat-card__head">
            <span className="admin-students-stat-card__icon" aria-hidden>
              <stat.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="admin-students-stat-card__title">{stat.label}</p>
          </div>
          <p className="admin-students-stat-card__value">{stat.value}</p>
          <span className="admin-students-stat-card__badge">{stat.badge}</span>
        </div>
        {stat.piePercent != null ? (
          <div
            className="admin-students-stat-card__pie"
            style={{ '--student-stat-pie': stat.piePercent } as CSSProperties}
            role="img"
            aria-label={`${stat.label} ${stat.piePercent}%`}
          >
            <span className="admin-students-stat-card__pie-inner">{stat.piePercent}%</span>
          </div>
        ) : null}
      </motion.article>
    ))}
  </div>
);

export default DocumentsOverviewStatGrid;
