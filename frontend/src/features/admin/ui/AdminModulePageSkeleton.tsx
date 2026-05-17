import { FunctionComponent } from 'react';
import { DashboardPanelSkeleton, DashboardStatsSkeleton } from '../dashboard/ui/DashboardSkeleton';

interface AdminModulePageSkeletonProps {
  tableRows?: number;
}

const AdminModulePageSkeleton: FunctionComponent<AdminModulePageSkeletonProps> = ({
  tableRows = 5,
}) => (
  <div className="admin-page space-y-6">
    <div className="admin-shimmer h-28 rounded-admin-xl" aria-hidden />
    <DashboardStatsSkeleton />
    <DashboardPanelSkeleton rows={tableRows} />
  </div>
);

export default AdminModulePageSkeleton;
