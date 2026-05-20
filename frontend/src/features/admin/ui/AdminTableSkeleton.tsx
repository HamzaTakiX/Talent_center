import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

interface AdminTableSkeletonRowsProps {
  colSpan: number;
  rows?: number;
}

/** Skeleton rows for desktop admin tables (tbody). */
export const AdminTableSkeletonRows: FunctionComponent<AdminTableSkeletonRowsProps> = ({
  colSpan,
  rows = 6,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr className="sr-only">
        <td colSpan={colSpan}>{t('admin.common.loading')}</td>
      </tr>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} aria-hidden>
          <td colSpan={colSpan} className="py-2.5">
            <Shimmer className="h-11 w-full rounded-xl" />
          </td>
        </tr>
      ))}
    </>
  );
};

interface AdminMobileTableSkeletonProps {
  count?: number;
}

/** Skeleton cards for mobile table layouts. */
export const AdminMobileTableSkeleton: FunctionComponent<AdminMobileTableSkeletonProps> = ({
  count = 4,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('admin.common.loading')}
    >
      <span className="sr-only">{t('admin.common.loading')}</span>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-inset)] p-4"
          aria-hidden
        >
          <Shimmer className="h-5 w-2/3" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-4/5" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="h-6 w-16 rounded-full" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminTableSkeletonRows;
