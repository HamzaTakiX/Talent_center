import { FunctionComponent } from 'react';

interface AllEncadrantsListCardHeaderProps {
  totalFormatted: string;
}

const AllEncadrantsListCardHeader: FunctionComponent<AllEncadrantsListCardHeaderProps> = ({ totalFormatted }) => (
  <div className="w-full px-6 pt-6 font-inter text-left">
    <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">All Encadrants ({totalFormatted})</div>
    <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">Detailed view of supervisors</div>
  </div>
);

export default AllEncadrantsListCardHeader;
