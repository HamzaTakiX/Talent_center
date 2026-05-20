import { FunctionComponent } from 'react';
import { DashboardStatsSkeleton, DashboardChartSkeleton, DashboardPanelSkeleton } from '../../../admin/dashboard/ui/DashboardSkeleton';

export const StudentDashboardPageSkeleton: FunctionComponent = () => (
  <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-5 pb-6 sm:space-y-6 md:space-y-7">
    <div className="overflow-hidden rounded-admin-xl border border-[var(--admin-border)] p-6">
      <div className="admin-shimmer mb-3 h-6 w-32 rounded-full" aria-hidden />
      <div className="admin-shimmer mb-2 h-8 w-2/3 max-w-md rounded-lg" aria-hidden />
      <div className="admin-shimmer h-4 w-1/2 max-w-sm rounded" aria-hidden />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-shimmer h-16 rounded-lg" aria-hidden />
        ))}
      </div>
    </div>
    <DashboardStatsSkeleton />
    <DashboardChartSkeleton />
    <div className="student-dashboard-main-grid">
      <div className="flex flex-col gap-5">
        <DashboardPanelSkeleton rows={3} />
        <DashboardPanelSkeleton rows={2} />
        <DashboardPanelSkeleton rows={2} />
      </div>
      <div className="student-dashboard-sidebar-stack">
        <DashboardPanelSkeleton rows={4} />
        <DashboardPanelSkeleton rows={3} />
      </div>
    </div>
  </div>
);

export default StudentDashboardPageSkeleton;
