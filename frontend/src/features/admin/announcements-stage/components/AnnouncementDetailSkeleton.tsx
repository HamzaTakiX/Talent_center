import { FunctionComponent } from 'react';

const AnnouncementDetailSkeleton: FunctionComponent = () => (
  <div className="admin-ann-detail-skeleton" aria-busy="true" aria-label="Loading announcement">
    <div className="admin-ann-detail-skeleton__hero admin-shimmer" />
    <div className="admin-ann-detail-skeleton__grid">
      <div className="admin-ann-detail-skeleton__main">
        <div className="admin-ann-detail-skeleton__panel admin-shimmer" />
        <div className="admin-ann-detail-skeleton__panel admin-shimmer admin-ann-detail-skeleton__panel--short" />
      </div>
      <div className="admin-ann-detail-skeleton__aside">
        <div className="admin-ann-detail-skeleton__panel admin-shimmer admin-ann-detail-skeleton__panel--short" />
        <div className="admin-ann-detail-skeleton__panel admin-shimmer admin-ann-detail-skeleton__panel--short" />
        <div className="admin-ann-detail-skeleton__panel admin-shimmer admin-ann-detail-skeleton__panel--short" />
      </div>
    </div>
  </div>
);

export default AnnouncementDetailSkeleton;
