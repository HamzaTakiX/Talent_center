import { FunctionComponent } from 'react';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

const CriticalAlertsSkeleton: FunctionComponent = () => (
  <div className="admin-alerts-skeleton" aria-busy="true">
    <div className="admin-alerts-skeleton__header">
      <Shimmer className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-4 w-36" />
        <Shimmer className="h-3 w-52 max-w-full" />
      </div>
      <Shimmer className="h-7 w-20 shrink-0 rounded-full" />
    </div>

    <div className="admin-alerts-skeleton__body">
      <div className="admin-alerts-skeleton__visual">
        <Shimmer className="h-[128px] w-[128px] rounded-full" />
        <div className="w-full space-y-2.5">
          <Shimmer className="h-2 w-full" />
          <Shimmer className="h-2 w-4/5" />
          <Shimmer className="h-2 w-3/5" />
        </div>
      </div>

      <div className="admin-alerts-skeleton__grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-alerts-skeleton__card">
            <div className="flex items-center justify-between gap-2">
              <Shimmer className="h-8 w-8 rounded-md" />
              <Shimmer className="h-5 w-14 rounded-full" />
            </div>
            <Shimmer className="h-7 w-12" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-1 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CriticalAlertsSkeleton;
