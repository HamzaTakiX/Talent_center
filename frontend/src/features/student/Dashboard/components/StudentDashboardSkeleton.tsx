import { FunctionComponent } from 'react';
import { DashboardChartSkeleton, DashboardPanelSkeleton } from '../../../admin/dashboard/ui/DashboardSkeleton';

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
    <div
      className="student-task-platform grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-5 sm:gap-4"
      aria-hidden
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="box-border min-h-[7.25rem] overflow-hidden rounded-[16px] border border-solid border-[var(--admin-border)] p-4"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div className="admin-shimmer h-9 w-9 rounded-[0.625rem]" />
            <div className="admin-shimmer h-3 w-24 rounded" />
          </div>
          <div className="admin-shimmer h-7 w-12 rounded" />
        </div>
      ))}
    </div>
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
