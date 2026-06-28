import { CSSProperties, FunctionComponent } from 'react';

const ShimmerBlock: FunctionComponent<{ className?: string; style?: CSSProperties }> = ({
  className = '',
  style,
}) => <div className={`admin-shimmer rounded-lg ${className}`} style={style} aria-hidden />;

export const DashboardStatsSkeleton: FunctionComponent = () => (
  <div className="admin-stats-grid" aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3.5">
        <ShimmerBlock className="h-4 w-4 rounded" />
        <div className="min-w-0 flex-1">
          <ShimmerBlock className="mb-1.5 h-3 w-2/3" />
          <ShimmerBlock className="h-5 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardPanelSkeleton: FunctionComponent<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="admin-panel flex flex-col gap-4 p-6">
    <ShimmerBlock className="h-5 w-40" />
    <ShimmerBlock className="h-4 w-56" />
    <div className="mt-2 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerBlock key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export const DashboardChartSkeleton: FunctionComponent = () => (
  <div className="admin-panel p-6">
    <ShimmerBlock className="mb-2 h-5 w-44" />
    <ShimmerBlock className="mb-6 h-4 w-64" />
    <div className="flex h-[260px] items-end gap-3 pt-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <ShimmerBlock
          key={i}
          className="flex-1 rounded-t-lg"
          style={{ height: `${40 + (i % 4) * 15}%` }}
        />
      ))}
    </div>
  </div>
);

export const DashboardPageSkeleton: FunctionComponent = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <ShimmerBlock className="mb-2 h-8 w-48" />
        <ShimmerBlock className="h-4 w-72" />
      </div>
      <ShimmerBlock className="h-10 w-full sm:w-40" />
    </div>
    <DashboardStatsSkeleton />
    <DashboardChartSkeleton />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DashboardPanelSkeleton />
      <DashboardPanelSkeleton />
    </div>
  </div>
);
