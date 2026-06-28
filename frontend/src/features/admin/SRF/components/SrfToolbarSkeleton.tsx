import { FunctionComponent } from 'react';

const SrfToolbarSkeleton: FunctionComponent = () => (
  <div className="admin-srf-toolbar-skeleton" aria-hidden>
    <div className="admin-shimmer admin-srf-toolbar-skeleton__search rounded-lg" />
    <div className="admin-shimmer admin-srf-toolbar-skeleton__filter rounded-lg" />
  </div>
);

export default SrfToolbarSkeleton;
