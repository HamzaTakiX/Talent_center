import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminKpiGrid from './AdminKpiGrid';

type AdminKpiGridColumns = 2 | 3 | 4 | 5;

interface AdminKpiGridSkeletonProps {
  count?: number;
  columns?: AdminKpiGridColumns;
}

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <span className={`admin-shimmer block rounded-md ${className}`} aria-hidden />
);

/** Skeleton KPI aligné sur AdminKpiGrid + AdminKpiStatCard (panneau unifié, cellules avec bordures). */
export const AdminKpiGridSkeleton: FunctionComponent<AdminKpiGridSkeletonProps> = ({
  count = 8,
  columns = 4,
}) => {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('admin.common.loading')}</span>
      <AdminKpiGrid columns={columns}>
        {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="admin-kpi-cell admin-kpi-cell--static admin-kpi-cell--skeleton"
          aria-hidden
        >
          <Shimmer className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full opacity-70" />
          <span className="admin-kpi-icon-wrap overflow-hidden">
            <Shimmer className="h-full w-full rounded-[inherit]" />
          </span>
          <span className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3 w-2/3 max-w-[6.5rem]" />
            <Shimmer className="h-5 w-1/3 max-w-[3.5rem]" />
          </span>
          <span className="admin-kpi-cell__chevron-spacer" aria-hidden />
        </div>
      ))}
      </AdminKpiGrid>
    </div>
  );
};

export default AdminKpiGridSkeleton;
