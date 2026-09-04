import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

export const ADMIN_TABLE_MIN_VISIBLE_ROWS = 5;

export function adminTableFillerCount(
  rowCount: number,
  minRows = ADMIN_TABLE_MIN_VISIBLE_ROWS,
): number {
  if (rowCount <= 0) return 0;
  return Math.max(0, minRows - rowCount);
}

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

export type AdminTableFillerVariant = 'student' | 'encadrant' | 'administrator';

interface AdminTableFillerRowsProps {
  rows: number;
  variant: AdminTableFillerVariant;
  selectionMode?: boolean;
}

const FillerIdentity: FunctionComponent<{ withEmail?: boolean }> = ({ withEmail = true }) => (
  <div className="admin-students-table__identity">
    <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
    <div className="admin-students-table__identity-meta min-w-0">
      <Shimmer className="h-3.5 w-28 rounded-md" />
      {withEmail ? <Shimmer className="h-3 w-36 rounded-md" /> : null}
    </div>
  </div>
);

const FillerBadge: FunctionComponent<{ className?: string }> = ({ className = 'w-16' }) => (
  <Shimmer className={`h-5 rounded-full ${className}`} />
);

const FillerActions: FunctionComponent = () => (
  <div className="flex justify-end">
    <Shimmer className="h-8 w-8 rounded-lg" />
  </div>
);

const FillerCheckbox: FunctionComponent = () => <Shimmer className="h-4 w-4 rounded" />;

function FillerStudentCells({ selectionMode }: { selectionMode: boolean }) {
  return (
    <>
      {selectionMode ? (
        <td>
          <FillerCheckbox />
        </td>
      ) : null}
      <td>
        <FillerIdentity />
      </td>
      <td>
        <Shimmer className="h-3.5 w-20 rounded-md" />
      </td>
      <td>
        <Shimmer className="h-3.5 w-16 rounded-md" />
      </td>
      <td>
        <FillerBadge className="w-12" />
      </td>
      <td>
        <Shimmer className="h-3 w-10 rounded-md" />
      </td>
      <td>
        <FillerBadge className="w-14" />
      </td>
      <td className="admin-students-table__actions text-end">
        <FillerActions />
      </td>
    </>
  );
}

function FillerEncadrantCells({ selectionMode }: { selectionMode: boolean }) {
  const td = 'box-border py-2 pl-2 pr-2 align-middle';
  return (
    <>
      {selectionMode ? (
        <td className={td}>
          <FillerCheckbox />
        </td>
      ) : null}
      <td className={td}>
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-9 shrink-0 rounded-full" />
          <Shimmer className="h-3.5 w-28 rounded-md" />
        </div>
      </td>
      <td className={td}>
        <Shimmer className="h-3.5 w-36 rounded-md" />
      </td>
      <td className={`${td} max-w-[140px]`}>
        <Shimmer className="h-3.5 w-12 rounded-md" />
      </td>
      <td className={`${td} max-w-[200px]`}>
        <Shimmer className="h-3.5 w-40 rounded-md" />
      </td>
      <td className={td}>
        <FillerBadge className="w-24" />
      </td>
      <td className={td}>
        <Shimmer className="h-3.5 w-10 rounded-md" />
      </td>
      <td className={td}>
        <FillerBadge className="w-14" />
      </td>
      <td className={td}>
        <FillerBadge className="w-14" />
      </td>
      <td className={`${td} text-end`}>
        <FillerActions />
      </td>
    </>
  );
}

function FillerAdministratorCells({ selectionMode }: { selectionMode: boolean }) {
  return (
    <>
      {selectionMode ? (
        <td>
          <FillerCheckbox />
        </td>
      ) : null}
      <td>
        <FillerIdentity />
      </td>
      <td>
        <FillerBadge className="w-20" />
      </td>
      <td className="max-w-[200px]">
        <Shimmer className="h-3 w-28 rounded-md" />
      </td>
      <td>
        <FillerBadge className="w-14" />
      </td>
      <td>
        <Shimmer className="h-3 w-24 rounded-md" />
      </td>
      <td>
        <Shimmer className="h-3 w-16 rounded-md" />
      </td>
      <td className="admin-students-table__actions text-end">
        <FillerActions />
      </td>
    </>
  );
}

/** Placeholder rows that match a real user row layout. */
export const AdminTableFillerRows: FunctionComponent<AdminTableFillerRowsProps> = ({
  rows,
  variant,
  selectionMode = false,
}) => {
  if (rows <= 0) return null;

  const rowClass =
    variant === 'encadrant'
      ? 'pointer-events-none box-border h-[52px] border-b border-solid border-[var(--admin-border)] last:border-b-0 opacity-55'
      : 'admin-table-row--interactive pointer-events-none opacity-55';

  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={`table-filler-${index}`} aria-hidden className={rowClass}>
          {variant === 'student' ? <FillerStudentCells selectionMode={selectionMode} /> : null}
          {variant === 'encadrant' ? <FillerEncadrantCells selectionMode={selectionMode} /> : null}
          {variant === 'administrator' ? (
            <FillerAdministratorCells selectionMode={selectionMode} />
          ) : null}
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
