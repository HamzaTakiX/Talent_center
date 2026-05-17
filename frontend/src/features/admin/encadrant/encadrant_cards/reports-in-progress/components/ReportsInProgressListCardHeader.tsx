import { FunctionComponent } from 'react';

interface ReportsInProgressListCardHeaderProps {
  totalFormatted: string;
}

const ReportsInProgressListCardHeader: FunctionComponent<ReportsInProgressListCardHeaderProps> = ({
  totalFormatted
}) => (
  <div className="w-full px-6 pt-6 font-inter text-left">
    <div className="text-base font-semibold leading-4 text-[var(--admin-text)]">Reports in Progress ({totalFormatted})</div>
    <div className="mt-1 text-base leading-6 text-[var(--admin-text-secondary)]">Detailed view of supervisors</div>
  </div>
);

export default ReportsInProgressListCardHeader;
