import { FunctionComponent } from 'react';
import { AdminSectionSkeletonShell } from '../../../admin/ui/AdminSectionSkeleton';

const StudentAnnouncementsFiltersSkeleton: FunctionComponent = () => (
  <AdminSectionSkeletonShell>
    <div className="admin-ann-feed student-ann-feed-panel" aria-hidden>
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__toolbar">
          <div className="admin-shimmer h-10 w-full rounded-lg" />
        </div>
        <div className="admin-ann-feed__filters-zone">
          <div className="admin-shimmer h-3 w-24 rounded" />
          <div className="admin-ann-feed__filters mt-3">
            <div className="admin-shimmer h-[4.25rem] w-full rounded-xl" />
            <div className="admin-shimmer h-[4.25rem] w-full rounded-xl" />
          </div>
          <div className="student-ann-feed__date-toggles mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-shimmer h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminSectionSkeletonShell>
);

export default StudentAnnouncementsFiltersSkeleton;
