import { FunctionComponent } from 'react';
import { AdminSectionSkeletonShell } from '../../ui/AdminSectionSkeleton';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

const RecentActivitySkeleton: FunctionComponent = () => (
  <AdminSectionSkeletonShell>
    <ul className="m-0 flex list-none flex-col gap-0 p-0" aria-hidden>
      {Array.from({ length: 7 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 border-b border-[var(--admin-border)] px-4 py-3 last:border-b-0 sm:px-5"
        >
          <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3.5 w-4/5 max-w-[16rem]" />
            <Shimmer className="h-3 w-1/2 max-w-[10rem]" />
          </div>
        </li>
      ))}
    </ul>
  </AdminSectionSkeletonShell>
);

export default RecentActivitySkeleton;
