import { FunctionComponent } from 'react';
import { AdminMobileTableSkeleton } from '../../ui';

const OffersListLoading: FunctionComponent = () => (
  <div className="px-4 py-2 sm:px-6">
    <AdminMobileTableSkeleton count={4} />
  </div>
);

export default OffersListLoading;
