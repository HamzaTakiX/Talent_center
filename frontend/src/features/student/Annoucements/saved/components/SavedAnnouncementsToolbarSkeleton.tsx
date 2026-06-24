import { FunctionComponent } from 'react';
import { AdminSectionSkeletonShell } from '../../../../admin/ui/AdminSectionSkeleton';

const SavedAnnouncementsToolbarSkeleton: FunctionComponent = () => (
  <AdminSectionSkeletonShell>
    <div className="admin-ann-feed student-ann-feed-panel" aria-hidden>
      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <div className="admin-shimmer h-10 w-10 rounded-[11px]" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="admin-shimmer h-5 w-40 rounded" />
              <div className="admin-shimmer h-3.5 w-64 max-w-full rounded" />
            </div>
          </div>
        </div>
        <div className="admin-ann-feed__toolbar">
          <div className="admin-shimmer h-10 w-full rounded-lg" />
        </div>
        <div className="admin-ann-feed__filters-zone">
          <div className="admin-shimmer h-3 w-24 rounded" />
          <div className="student-ann-feed__date-toggles mt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="admin-shimmer h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminSectionSkeletonShell>
);

export default SavedAnnouncementsToolbarSkeleton;
