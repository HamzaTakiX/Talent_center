import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { AdminChartDonutSkeleton, AdminStudentsStatsSkeleton } from '../../../ui/AdminSectionSkeleton';
import { AdminPanelListSkeleton } from '../../../ui/AdminSectionSkeleton';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

const DocumentsPageSkeleton: FunctionComponent = () => (
  <motion.div
    className="admin-doc-workspace admin-doc-workspace--hub admin-doc-skeleton"
    role="status"
    aria-busy="true"
    aria-live="polite"
  >
    <div className="admin-doc-skeleton__hero admin-shimmer" aria-hidden />

    <AdminStudentsStatsSkeleton count={6} withPiePattern="all-but-first" />

    <div className="admin-doc-skeleton__nav" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Shimmer key={i} className="admin-doc-skeleton__nav-tile" />
      ))}
    </div>

    <section className="admin-doc-analytics admin-doc-skeleton__analytics" aria-hidden>
      <div className="admin-doc-skeleton__section-head">
        <Shimmer className="h-9 w-9 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-3 w-56" />
        </div>
      </div>
      <div className="admin-doc-charts-grid">
        <div className="admin-doc-chart-card">
          <Shimmer className="mb-3 h-4 w-32" />
          <AdminChartDonutSkeleton legendItems={4} />
        </div>
        <div className="admin-doc-chart-card">
          <Shimmer className="mb-3 h-4 w-36" />
          <AdminChartDonutSkeleton legendItems={3} />
        </div>
        <div className="admin-doc-chart-card admin-doc-chart-card--wide">
          <Shimmer className="mb-3 h-4 w-44" />
          <div className="admin-doc-occupancy-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-doc-occupancy-skeleton__row admin-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </section>

    <div className="admin-module-panel admin-doc-table-panel admin-doc-skeleton__table" aria-hidden>
      <div className="admin-doc-skeleton__section-head">
        <Shimmer className="h-9 w-9 rounded-lg" />
        <Shimmer className="h-4 w-36" />
      </div>
      <div className="admin-doc-table-panel__body">
        <AdminPanelListSkeleton rows={5} />
      </div>
    </div>
  </motion.div>
);

export default DocumentsPageSkeleton;
